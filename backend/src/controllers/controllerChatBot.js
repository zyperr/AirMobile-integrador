import ModelProductos from '../models/modelProductos.js';
import { schemaBotFiltros } from '../schemas/schemaBotProductos.js';
import { responderMensaje, CATEGORIAS_BOT } from '../utils/botIA.js';

export const obtenerProductosBot = async (req, res) => {
    const { error, value } = schemaBotFiltros.validate(req.query);

    if (error) {
        return res.status(400).json({
            exito: false,
            error: error.details[0].message
        });
    }

    try {
        const filtros = {
            busqueda: value.busqueda || '',
            categoria: value.categoria || ''
        };

        const page = value.page;
        const limit = value.limit;
        const offset = (page - 1) * limit;

        const [productos, totalResultados] = await Promise.all([
            ModelProductos.getBotCatalog(filtros, limit, offset),
            ModelProductos.countBotCatalog(filtros)
        ]);

        const totalPaginas = Math.ceil(totalResultados / limit);

        // Truncamos la descripción a 80 caracteres para no saturar el contexto del LLM
        const productosParseados = productos.map((p) => ({
            id: p.id,
            nombre_producto: p.nombre_producto,
            precio: p.precio,
            categoria: p.categoria,
            condicion: p.condicion,
            descripcion: p.descripcion
                ? p.descripcion.substring(0, 80).trimEnd()
                : ''
        }));

        return res.status(200).json({
            exito: true,
            paginacion: {
                paginaActual: page,
                limitePorPagina: limit,
                totalResultados,
                totalPaginas,
                tienePaginaSiguiente: page < totalPaginas,
                tienePaginaAnterior: page > 1
            },
            data: productosParseados
        });
    } catch (err) {
        console.error('Error en obtenerProductosBot:', err);
        return res.status(500).json({ exito: false, message: 'Error interno del servidor' });
    }
};
// ─────────────────────────────────────────────────────────────
// Chat con IA (Groq) — reemplaza el webhook de n8n en producción
// POST /api/bot/chat  { chatInput, sessionId, nombreCliente }
// Responde { output } (mismo formato que devolvía n8n)
// ─────────────────────────────────────────────────────────────

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const MAX_LARGO_MENSAJE = 500;
const MAX_MENSAJES_HISTORIAL = 12;       // últimos 6 intercambios
const MAX_MENSAJES_POR_MINUTO = 10;      // por sesión, para cuidar la cuota gratis
const SESION_EXPIRA_MS = 60 * 60 * 1000; // 1 hora sin actividad

// Memoria en RAM: se reinicia si Render duerme o reinicia el servicio (aceptable para una demo)
const sesiones = new Map();

setInterval(() => {
    const ahora = Date.now();
    for (const [id, s] of sesiones) {
        if (ahora - s.ultimaActividad > SESION_EXPIRA_MS) sesiones.delete(id);
    }
}, 10 * 60 * 1000).unref();

const recortarDescripcion = (p) => ({
    id: p.id,
    nombre_producto: p.nombre_producto,
    precio: p.precio,
    categoria: p.categoria,
    condicion: p.condicion,
    descripcion: p.descripcion ? String(p.descripcion).substring(0, 80).trimEnd() : ''
});

const ejecutarHerramienta = async (nombre, args) => {
    if (nombre === 'consultar_catalogo') {
        const productos = await ModelProductos.getBotCatalog({ busqueda: '', categoria: '' }, 30, 0);
        return { exito: true, total: productos.length, data: productos.map(recortarDescripcion) };
    }

    if (nombre === 'buscar_producto') {
        const busqueda = typeof args.busqueda === 'string' ? args.busqueda.trim().slice(0, 100) : '';
        const categoria = CATEGORIAS_BOT.includes(args.categoria) ? args.categoria : '';

        let productos = await ModelProductos.getBotCatalog({ busqueda, categoria }, 8, 0);
        // Si el nombre exacto no aparece, probamos solo con la categoría para ofrecer alternativas
        if (productos.length === 0 && busqueda && categoria) {
            productos = await ModelProductos.getBotCatalog({ busqueda: '', categoria }, 8, 0);
            return { exito: true, coincidenciaExacta: false, total: productos.length, data: productos.map(recortarDescripcion) };
        }
        return { exito: true, total: productos.length, data: productos.map(recortarDescripcion) };
    }

    return { exito: false, error: `Herramienta desconocida: ${nombre}` };
};

const llamarGroq = async (mensajes, herramientas) => {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), 30000);
    try {
        const respuesta = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: mensajes,
                ...(herramientas && { tools: herramientas, tool_choice: 'auto' }),
                temperature: 0.4,
                max_tokens: 1024
            }),
            signal: controlador.signal
        });

        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            const error = new Error(`Groq respondió ${respuesta.status}: ${detalle.slice(0, 300)}`);
            error.status = respuesta.status;
            throw error;
        }
        const data = await respuesta.json();
        return data.choices?.[0]?.message || {};
    } finally {
        clearTimeout(timeout);
    }
};

export const chatConIA = async (req, res) => {
    if (!process.env.GROQ_API_KEY) {
        return res.status(503).json({ output: 'El asistente no está configurado en este momento.' });
    }

    const chatInput = typeof req.body?.chatInput === 'string' ? req.body.chatInput.trim() : '';
    const nombreCliente = typeof req.body?.nombreCliente === 'string' ? req.body.nombreCliente.slice(0, 60) : 'Invitado';
    const sessionId = (typeof req.body?.sessionId === 'string' && req.body.sessionId.slice(0, 100)) || `ip_${req.ip}`;

    if (!chatInput) {
        return res.status(400).json({ output: 'Escribí un mensaje para que pueda ayudarte.' });
    }
    if (chatInput.length > MAX_LARGO_MENSAJE) {
        return res.status(400).json({ output: `Tu mensaje es muy largo. Probá con menos de ${MAX_LARGO_MENSAJE} caracteres.` });
    }

    const ahora = Date.now();
    const sesion = sesiones.get(sessionId) || { historial: [], pedidos: [], ultimaActividad: ahora };
    sesion.pedidos = sesion.pedidos.filter(t => ahora - t < 60000);
    if (sesion.pedidos.length >= MAX_MENSAJES_POR_MINUTO) {
        return res.status(429).json({ output: 'Estás enviando muchos mensajes seguidos. Esperá unos segundos y volvé a intentar 🙂' });
    }
    sesion.pedidos.push(ahora);
    sesion.ultimaActividad = ahora;
    sesiones.set(sessionId, sesion);

    try {
        const output = await responderMensaje({
            historial: sesion.historial,
            mensajeUsuario: chatInput,
            nombreCliente,
            llamarModelo: llamarGroq,
            ejecutarHerramienta
        });

        // Guardamos solo el texto (sin las llamadas a herramientas) para ahorrar tokens
        sesion.historial.push({ role: 'user', content: chatInput }, { role: 'assistant', content: output });
        sesion.historial = sesion.historial.slice(-MAX_MENSAJES_HISTORIAL);

        return res.status(200).json({ output });
    } catch (err) {
        console.error('Error en chatConIA:', err.message);
        if (err.status === 429) {
            return res.status(429).json({ output: 'El asistente está recibiendo muchas consultas. Probá de nuevo en un minuto 🙏' });
        }
        return res.status(500).json({ output: 'Lo siento, hubo un problema al procesar tu consulta. Intentá nuevamente.' });
    }
};
