

import ModelFactura from "../models/modelFactura.js";

import ModelCarrito from "../models/modelCarrito.js";
import ModelDetalleFactura from "../models/modelDetalleFactura.js";
import UsuarioModel from "../models/modelUsuario.js";
import { ROLES } from "../utils/roles.js";
import { ESTADOS } from "../utils/estados.js";



export const crearFactura = async (req, res) => {
    try {
        const idUsuario = req?.user?.id;

        if (!idUsuario) {
            return res.status(401).json({exito:false, message: "Credenciales invalidas" });
        }

        const carrito = await ModelCarrito.getCarrito(idUsuario);

        if (!carrito || carrito.length === 0
        ) {
            return res.status(400).json({ exito:false,message: "El carrito está vacío, no se puede crear una factura." });
        }

        let totalCalculado = 0;
        for (const item of carrito) {
            totalCalculado += item.cantidad * item.precio;
        }


        // .toFixed(2) corta a dos decimales pero lo vuelve texto ("150.50")
        // Number() lo vuelve a convertir en número para guardarlo en la DB
        totalCalculado = Number(totalCalculado.toFixed(2));
        const idFacturaCreada = await ModelFactura.createFactura(idUsuario, totalCalculado);

        //creamos los detalles de la factura con cada producto del carrito
        for (const item of carrito) {
            await ModelDetalleFactura.createDetalleFactura(idFacturaCreada, item.producto_id, item.cantidad, item.precio);
        }


        //vaciamos el carrito del usuario luego de realizar la compra
        await ModelCarrito.emptyCarrito(idUsuario);

        return res.status(201).json({
            exito: true,
            message: "Compra procesada con éxito",
            idFactura: idFacturaCreada
        });



    } catch (err) {
        console.log(err);
        return res.status(500).json({ exito:false,message: "Error al crear la factura" });
    }

}


export const obtenerTodasLasFacturas = async (req, res) => {
    try {
        const idUsuarioActual = req?.user?.id;

        if (!idUsuarioActual) {
            return res.status(401).json({exito:false, message: "Credenciales inválidas" });
        }

        // SEGURIDAD: Esta ruta es exclusiva para Administradores
        const rolUsuario = await UsuarioModel.getRol(idUsuarioActual);
        if (rolUsuario !== ROLES.ADMIN) {
            return res.status(403).json({ exito:false,message: "Solo los administradores pueden ver todas las facturas del sistema" });
        }

        // PAGINACIÓN: Leer la página y el límite de la URL (con valores por defecto)
        // Ejemplo de URL en Postman: /api/facturas?page=2&limit=5
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        // Le pasamos el límite y el offset a tu modelo


        const [facturas, totalResultados] = await Promise.all([
            ModelFactura.getFacturas(limit, offset),
            ModelFactura.countFacturas()
        ]);


        const totalPaginas = Math.ceil(totalResultados / limit);

        return res.status(200).json({
            exito: true,
            paginaActual: page,
            limitePorPagina: limit,
            cantidadResultados: facturas.length,
            totalResultados: totalResultados,
            totalPaginas: totalPaginas,
            tienePaginaSiguiente: page < totalPaginas,
            tienePaginaAnterior: page > 1,
            facturas: facturas
        });

    } catch (err) {
        console.error("Error al obtener las facturas:", err);
        return res.status(500).json({exito:false, message: "Error interno al obtener las facturas" });
    }
};



// OBTENER FACTURAS DE UN USUARIO
export const obtenerFacturasDeUsuario = async (req, res) => {
    try {
        const idUsuarioActual = req?.user?.id;

        if (!idUsuarioActual) {
            return res.status(401).json({ exito:false, message: "Credenciales inválidas" });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        // EJECUCIÓN EN PARALELO
        let [facturas, totalResultados] = await Promise.all([
            ModelFactura.getFacturasDeUsuario(idUsuarioActual, limit, offset),
            ModelFactura.countFacturasDeUsuario(idUsuarioActual)
        ]);

        const totalPaginas = Math.ceil(totalResultados / limit);

        // ==========================================
        // FORMATEO DE FECHAS PARA EL HISTORIAL
        // ==========================================
        facturas = facturas.map(factura => {
            if (factura.fecha) {
                const fechaObjeto = new Date(factura.fecha + 'Z');
                
                // Para el historial suele ser mejor una fecha más corta (Ej: "14 May 2026")
                factura.fecha_formateada = fechaObjeto.toLocaleString("es-AR", {
                    timeZone: "America/Argentina/Buenos_Aires",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });
            }
            return factura;
        });

        return res.status(200).json({
            exito: true,
            paginacion: { 
                paginaActual: page,
                limitePorPagina: limit,
                totalResultados: totalResultados,
                totalPaginas: totalPaginas,
                tienePaginaSiguiente: page < totalPaginas,
                tienePaginaAnterior: page > 1
            },
            facturas: facturas // Ahora todas vienen con su fecha_formateada
        });

    } catch (err) {
        console.error("Error al obtener las facturas del usuario:", err);
        return res.status(500).json({ exito:false, message: "Error interno al obtener las facturas del usuario" });
    }
};

// OBTENER UNA FACTURA POR ID
export const obtenerFactura = async (req, res) => {
    try {

        const idUsuarioActual = req?.user?.id;

        if (!idUsuarioActual) {
            return res.status(401).json({ exito:false,message: "Credenciales inválidas" });
        }
        const idFactura = req?.params?.id;
        if (!idFactura) {
            return res.status(400).json({exito:false, message: "ID de factura no proporcionado" });
        }

        const factura = await ModelFactura.getFacturaById(idFactura);

        if (!factura) {
            return res.status(404).json({exito:false, message: "No se ha encontrado la factura" });
        }


        const rolUsuario = await UsuarioModel.getRol(idUsuarioActual);

        // Si el que pide la factura no es el dueño, y tampoco es Admin, lo rebotamos.
        if (factura.usuario_id !== idUsuarioActual && rolUsuario !== ROLES.ADMIN) {
            return res.status(403).json({ exito:false,message: "No tienes permiso para ver esta factura" });
        }

        return res.status(200).json({
            exito: true,
            factura: factura,
            message: "Se obtuvo la factura"
        });


    } catch (err) {
        console.log(err); return res.status(500).json({ exito:false,message: "Error al obtener la factura" });
    }
}


export const actualizarEstadoFactura = async (req, res) => {
    try {
        const idUsuario = req?.user?.id;
        if (!idUsuario) {
            return res.status(401).json({exito:false, message: "Credenciales inválidas" });
        }

        const rol = await UsuarioModel.getRol(idUsuario);
        if (rol !== ROLES.ADMIN) {
            return res.status(403).json({ exito:false,message: "No tienes permisos para alterar facturas" });
        }


        const idFactura = req.params.id;
        const { estado } = req.body;

        if (!estado || !Object.values(ESTADOS).includes(estado)) {
            return res.status(400).json({
                exito:false,
                message: `Estado no válido. Debe ser uno de: ${Object.values(ESTADOS).join(', ')}`
            });
        }


        const factura = await ModelFactura.getFacturaById(idFactura);
        if (!factura) {
            return res.status(404).json({exito:false, message: "No se ha encontrado la factura" });
        }

        await ModelFactura.updateEstadoFactura(idFactura, estado);

        return res.status(200).json({
            exito: true,
            factura: {
                ...factura,
                estado: estado
            },
            message: "Se actualizo la factura con exito"
        });

    } catch (err) {
        console.log(err); return res.status(500).json({ exito:false,message: "Error al actualizar el estado de la factura" });
    }
}

export const obtenerDetalleFactura = async (req, res) => {
    try {
        const idUsuarioActual = req?.user?.id;

        if (!idUsuarioActual) {
            return res.status(401).json({ exito:false,message: "Credenciales inválidas" });
        }

        const idFactura = req.params.id;
        const factura = await ModelDetalleFactura.getDetallesFacturaByFacturaId(idFactura);

        if (!factura) {
            return res.status(404).json({ exito:false,message: "No se ha encontrado el detalle de la factura" });
        }


        const rolUsuario = await UsuarioModel.getRol(idUsuarioActual);

        // Si el usuario no es el dueño de la factura y TAMPOCO es admin... ¡lo bloqueamos!
        if (factura.usuario_id !== idUsuarioActual && rolUsuario !== ROLES.ADMIN) {
            return res.status(403).json({ exito:false,message: "No tienes permiso para ver esta factura" });
        }


        return res.status(200).json({
            exito: true,
            detalleFactura: factura,
            message: "Se obtuvo los detalles de la factura"
        });

    } catch (err) {
        console.log(err); return res.status(500).json({ exito:false,message: "Error al obtener el detalle de la factura" });
    }
}