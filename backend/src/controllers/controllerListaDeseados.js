

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

        const [listaDeseados, totalEnDeseados] = await Promise.all([
            ModelListaDeseados.getWishListByUserId(idUsuario),
            ModelListaDeseados.countWishListByUserId(idUsuario)
        ]);
        
        if (listaDeseados.error) {
            return res.status(400).json({ exito: false, message: listaDeseados.error });
        }
        
        // CORRECCIÓN: Iteramos sobre el arreglo de productos
        const parsedListaDeseados = listaDeseados.map(producto => ({
            ...producto,
            // Validamos que exista antes de parsear, si no, devolvemos un arreglo vacío
            imagen_url: producto.imagen_url ? JSON.parse(producto.imagen_url) : [],
            capacidad: producto.capacidad ? JSON.parse(producto.capacidad) : []
        }));

        res.status(200).json({
            exito: true,
            message: "Lista de deseados obtenida",
            data: parsedListaDeseados,
            total: totalEnDeseados
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


export const ProductosEnDeseados = async (req, res) => {
    try{
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


        const estaEnDeseados = await ModelListaDeseados.isProductInWishList(idUsuario, idProducto);

        res.status(200).json({
            exito: true,
            message: "Verificación de producto en lista de deseados completada",
            data: estaEnDeseados 
        });
    }catch(err){
        console.error("Error al verificar producto en lista de deseados:", err);
        res.status(500).json({ exito: false, message: "Error interno al verificar producto en lista de deseados." });
    }
}