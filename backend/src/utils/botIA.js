// Lógica del asistente virtual con IA (Groq).
// Reemplaza al workflow de n8n + Ollama: mismo prompt, mismas dos herramientas.
// No depende de la base de datos ni de Express, así se puede probar aislado.

export const CATEGORIAS_BOT = [
    'celulares', 'tablets', 'relojes', 'auriculares', 'cargadores',
    'cables', 'powerbanks', 'fundas', 'protectores', 'accesorios'
];

export const construirPromptSistema = (nombreCliente) => `Eres el asistente de AirMobile, tienda de iPhones, iPads, Apple Watch, AirPods y accesorios.
${nombreCliente && nombreCliente !== 'Invitado' ? `El cliente con el que hablás se llama ${nombreCliente}.\n` : ''}
## HERRAMIENTAS — USO OBLIGATORIO
Nunca informes productos, precios ni stock desde tu memoria. Siempre usá una herramienta primero.

- "consultar_catalogo" → el usuario pregunta qué hay en general sin especificar nada ("qué venden", "qué tienen", "mostrame todo").
- "buscar_producto" → el usuario menciona una categoría, modelo, presupuesto o perfil ("iPhone 13", "fundas", "algo para mi mamá", "tengo $500").

## FORMATO DE RESPUESTA — OBLIGATORIO
Para CUALQUIER producto que devuelva una herramienta, el formato es exactamente este:

**[Nombre del producto]** - $[precio]
[Una línea de descripción breve]
[Ver detalles](/producto/[id])

Para listar varios productos, agrupalos con ### Categoría y usá una lista:
### 📱 Celulares
- **iPhone 13** - $650.00: Chip A15, pantalla OLED. [Ver detalles](/producto/4)

Nunca omitas el precio ni el enlace. El ID del enlace es el campo "id" exacto del JSON.
Usá EXACTAMENTE el precio que devuelve la herramienta. Está prohibido inventar productos o precios.
Si mostrás el catálogo general, mostrá como máximo 2 o 3 productos por categoría.

## RECOMENDACIONES
Si el usuario pide recomendación sin presupuesto → preguntá el rango de precio.
Si el usuario pide recomendación sin perfil → preguntá para quién y para qué uso.
Si tiene perfil Y presupuesto → usá "buscar_producto" de inmediato.

## REGLAS GENERALES
- Respondé siempre en español, de forma amigable y concisa.
- Solo respondés temas de AirMobile y tecnología Apple.
- Si el producto no existe → decí que no está y ofrecé alternativa solo si la herramienta devolvió algo similar.
- Cuando corresponda, cerrá con una pregunta amigable para seguir la conversación.

## DATOS DE LA TIENDA
- Horarios: Lun-Vie 9-18hs | Sáb 9-13hs
- Garantía usados: 90 días | Envíos: ~5 días hábiles
- WhatsApp: 261 000 3366 | Local 54, Shopping Centro`;

export const HERRAMIENTAS = [
    {
        type: 'function',
        function: {
            name: 'consultar_catalogo',
            description: 'Devuelve el catálogo general de productos. Usar SOLO cuando el usuario pregunta de forma genérica qué productos hay, sin mencionar un producto, modelo ni categoría.',
            parameters: { type: 'object', properties: {} }
        }
    },
    {
        type: 'function',
        function: {
            name: 'buscar_producto',
            description: 'Busca productos por nombre/modelo y/o categoría. Usar cuando el usuario menciona un producto, modelo, categoría, presupuesto o perfil específico.',
            parameters: {
                type: 'object',
                properties: {
                    busqueda: {
                        type: 'string',
                        description: 'Nombre o modelo específico (ej: "iPhone 13", "AirPods Pro", "funda transparente"). Vacío si el usuario solo describe un perfil o característica.'
                    },
                    categoria: {
                        type: 'string',
                        enum: CATEGORIAS_BOT,
                        description: 'Categoría inferida: celulares (iPhones), tablets (iPads), relojes (Apple Watch), auriculares (AirPods), cargadores, cables, powerbanks, fundas, protectores (vidrios templados), accesorios (AirTags, adaptadores).'
                    }
                }
            }
        }
    }
];

const MAX_VUELTAS_HERRAMIENTAS = 4;

/**
 * Conversa con el modelo hasta obtener una respuesta final.
 * @param {object[]} historial      mensajes previos [{role:'user'|'assistant', content}]
 * @param {string}   mensajeUsuario mensaje nuevo
 * @param {string}   nombreCliente  nombre para personalizar (o 'Invitado')
 * @param {(mensajes:object[], herramientas:object[]) => Promise<object>} llamarModelo
 *        devuelve el "message" del modelo ({content, tool_calls})
 * @param {(nombre:string, args:object) => Promise<object>} ejecutarHerramienta
 * @returns {Promise<string>} texto final para el usuario
 */
export async function responderMensaje({ historial, mensajeUsuario, nombreCliente, llamarModelo, ejecutarHerramienta }) {
    const mensajes = [
        { role: 'system', content: construirPromptSistema(nombreCliente) },
        ...historial,
        { role: 'user', content: mensajeUsuario }
    ];

    for (let vuelta = 0; vuelta < MAX_VUELTAS_HERRAMIENTAS; vuelta++) {
        // En la última vuelta no ofrecemos herramientas para forzar una respuesta en texto.
        const herramientas = vuelta < MAX_VUELTAS_HERRAMIENTAS - 1 ? HERRAMIENTAS : undefined;
        const respuesta = await llamarModelo(mensajes, herramientas);
        const llamadas = respuesta.tool_calls || [];

        if (llamadas.length === 0) {
            return (respuesta.content || '').trim() || 'Perdón, no pude generar una respuesta. ¿Podés reformular tu consulta?';
        }

        mensajes.push({ role: 'assistant', content: respuesta.content || null, tool_calls: llamadas });

        for (const llamada of llamadas) {
            let resultado;
            try {
                const args = llamada.function.arguments ? JSON.parse(llamada.function.arguments) : {};
                resultado = await ejecutarHerramienta(llamada.function.name, args);
            } catch (err) {
                console.error(`Error en la herramienta ${llamada.function?.name}:`, err.message);
                resultado = { exito: false, error: 'No se pudo consultar la base de datos en este momento.' };
            }
            mensajes.push({
                role: 'tool',
                tool_call_id: llamada.id,
                name: llamada.function.name,
                content: JSON.stringify(resultado)
            });
        }
    }

    return 'Perdón, tuve un problema procesando tu consulta. ¿Podés intentarlo de nuevo?';
}
