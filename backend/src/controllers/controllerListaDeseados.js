

import ModelListaDeseados from "../models/modelListaDeseados.js";
import ModelUsuario from "../models/modelUsuario.js";
import ModelProductos from "../models/modelProductos.js";




export const agregarAListaDeseados = async (req, res) => {
    try {

        const idUsuario = req?.user?.id;

        const usuario = await ModelUsuario.getbyId(idUsuario);

        if (!usuario) {
            return res.status(404).json({ exito: false, message: "Usuario no encontrado" });
        }

        const idProducto = req.params.id;
        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ exito: false, message: "Producto no encontrado" });
        }

        const listaDeseados = await ModelListaDeseados.addWishList(idUsuario, idProducto);

        if (listaDeseados.error) {
            return res.status(400).json({ exito: false, message: listaDeseados.error });
        }

        res.status(200).json({
            exito: true,
            message: "Producto agregado a la lista de deseados",
            detalle: listaDeseados.accion //retorna insertado.
        })

    } catch (err) {
        console.error("Error al agregar a la lista de deseados:", err);
        res.status(500).json({ exito: false, message: "Error interno al agregar a la lista de deseados." });
    }
}

export const obtenerListaDeseados = async (req, res) => {
    try {
        const idUsuario = req?.user?.id;

        const usuario = await ModelUsuario.getbyId(idUsuario);

        if (!usuario) {
            return res.status(404).json({ exito: false, message: "Usuario no encontrado" });
        }

        const listaDeseados = await ModelListaDeseados.getWishList(idUsuario);

        res.status(200).json({
            exito: true,
            message: "Lista de deseados obtenida",
            detalle: listaDeseados
        })
    } catch (err) {
        console.error("Error al obtener la lista de deseados:", err);
        res.status(500).json({ exito: false, message: "Error interno al obtener la lista de deseados." });
    }
}

export const eliminarDeListaDeseados = async (req, res) => {
    try {
        const idUsuario = req?.user?.id;

        const usuario = await ModelUsuario.getbyId(idUsuario);

        if (!usuario) {
            return res.status(404).json({ exito: false, message: "Usuario no encontrado" });
        }

        const idProducto = req.params.id;
        const producto = await ModelProductos.getById(idProducto);

        if(!producto) {
            return res.status(404).json({ exito: false, message: "Producto no encontrado" });
        }
        const resultado = await ModelListaDeseados.removeWishList(idUsuario, idProducto);

        if (resultado.error) {
            return res.status(400).json({ exito: false, message: resultado.error });
        }

        res.status(200).json({
            exito: true,
            message: "Producto eliminado de la lista de deseados",
            detalle: resultado.accion //retorna eliminado.
        })

    } catch (err) {
        console.error("Error al eliminar de la lista de deseados:", err);
        res.status(500).json({ exito: false, message: "Error interno al eliminar de la lista de deseados." });
    }
}