import ModelProductos from "../models/modelProductos.js";
import UsuarioModel from "../models/modelUsuario.js";
import { schemaProductos } from "../schemas/schemaProductos.js";
import { schemaActualizarProducto } from "../schemas/schemaUpdateProducto.js";
import { ROLES } from "../utils/roles.js";


export const obtenerProductos = async (req, res) => {
    try {
        const productos = await ModelProductos.getAll();
        const productosParseados = productos.map((producto) => {
            return {
                ...producto,
                capacidad: JSON.parse(producto.capacidad)
            }
        })
        return res.status(200).json(productosParseados)
    } catch (err) {
        console.error(err)

        res.status(500).json({ error: "Error al obtener los productos" })
    }
}


export const obtenerProducto = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) {
            return res.status(400).json({ message: "No se ha proporcionado un id" })
        }

        const producto = await ModelProductos.getById(id);

        if (!producto) {
            return res.status(404).json({ message: `No se ha encontrado el producto con el id: ${id}` })
        }

        const parsedProducto = {
            ...producto,
            capacidad: JSON.parse(producto.capacidad)
        }
        return res.status(200).json(parsedProducto)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Error al obtener el producto" })
    }
}

export const crearProducto = async (req, res) => {

    const { error, value } = schemaProductos.validate(req.body, { abortEarly: false });

    if (error) {
        const erroresLimpios = error.details.map(detalle => detalle.message);
        return res.status(400).json({
            exito: false,
            mensaje: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    };
    try {
        const idUsuario = req.user.id

        if (!idUsuario) {
            return res.status(401).json({ message: "Creedenciales invalidas" })
        }
        const rol = await UsuarioModel.getRol(id)
        
        if (rol !== ROLES.ADMIN) {
            return res.status(403).json({ message: "El usuario no tiene permisos para esto" })
        
        }
        const product = await ModelProductos.createProduct(value)
        

        return res.status(200).json({ message: "Producto creado con exito" })

    } catch (err) {
        console.error(err)

        return res.status(500).json({ error: "Error al crear el producto" })
    }
}

export const actualizarProducto = async (req, res) => {
    const { error, value } = schemaActualizarProducto.validate(req.body, { abortEarly: false });

    if (error) {
        const erroresLimpios = error.details.map(detalle => detalle.message);
        return res.status(400).json({
            exito: false,
            mensaje: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    };

    try {

        const idUsuario = req.user.id
        if (!idUsuario) {
            return res.status(401).json({ message: "Creedenciales invalidas" })
        }
        const rol = await UsuarioModel.getRol(idUsuario)
        console.log(rol)
        if (rol !== ROLES.ADMIN) {
            return res.status(403).json({ message: "El usuario no tiene permisos para esto" })
        }

        let dataParaActualizar = { ...value };


        if (dataParaActualizar.capacidad) {
            dataParaActualizar.capacidad = JSON.stringify(dataParaActualizar.capacidad);
        }

        const idProducto = req.params.id

        const productoActualizado = await ModelProductos.updateProduct(idProducto, dataParaActualizar);


        return res.status(200).json(productoActualizado)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Error al actualizar un producto" })
    }
}
