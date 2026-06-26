import ModelProductos from '../models/modelProductos.js';
import { schemaBotFiltros } from '../schemas/schemaBotProductos.js';

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