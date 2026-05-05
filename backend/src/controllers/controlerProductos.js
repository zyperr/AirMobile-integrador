import ModelProductos from "../models/modelProductos.js";
import UsuarioModel from "../models/modelUsuario.js";
import { schemaProductos } from "../schemas/schemaProductos.js";
import { schemaFiltrosProductos } from "../schemas/schemaQueriesFiltros.js";
import { schemaActualizarProducto } from "../schemas/schemaUpdateProducto.js";
import { procesarArchivo } from "../utils/leerArchivos.js";
import { ROLES } from "../utils/roles.js";
import Joi from "joi";

export const obtenerProductos = async (req, res) => {
    const { error, value } = schemaFiltrosProductos.validate(req.query);
    console.log(value)
    if (error) {
        return res.status(400).json({
            exito: false,
            // error.details[0].message saca el mensaje en español que armamos arriba
            error: error.details[0].message
        });
    }
    try {

        const filtros = {
            categoria: value.categoria,
            precioMin: value.precioMin,
            precioMax: value.precioMax,
            busqueda: value.busqueda
        };
        const productos = await ModelProductos.getAll(filtros);




        const productosParseados = productos.map((producto) => {
            return {
                ...producto,
                capacidad: JSON.parse(producto.capacidad)
            }
        })
        return res.status(200).json({
            exito: true,
            total: productosParseados.length,
            data: productosParseados
        });
    } catch (err) {
        console.error(err)

        return res.status(500).json({ error: "Error interno del servidor" });
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

export const bulkUpload = async (req, res) => {
    try {
        const idUsuario = req?.user?.id;

        console.log(idUsuario);

        if (!idUsuario) {
            return res.status(401).json({ message: "Creedenciales invalidas" })

        }

        const rol = await UsuarioModel.getRol(idUsuario);
        console.log(rol)
        if (rol !== ROLES.ADMIN) {
            return res.status(403).json({ message: "El usuario no tiene permisos para esto" })
        }

        if (!req.file) {
            return res.status(400).json({ error: "Por favor, subí un archivo." });
        }

        const nombreArchivo = req.file.originalname;
        const datosCrudos = req.file.buffer;
        const extension = nombreArchivo.split('.').pop().toLowerCase(); // "json", "csv" o "xlsx"
        const sepradorCSV = req.body.separator || ',';

        console.log(`Extension del archivo ${extension}`)
        console.log(sepradorCSV)

        const productosArray = await procesarArchivo(req.file.buffer, extension, sepradorCSV);

        const productosMapeados = productosArray.map(prod => {
            return {
                nombre_producto: prod.nombre_producto|| prod.nombre,
                categoria: prod.categoria,
                precio: prod.precio,
                capacidad: prod.capacidad ? [prod.capacidad] : [],
                descripcion: prod.descripcion,
                imagen_url: prod.imagen || prod.imagen_url,
                condicion: prod.condicion || prod.estado,
                categoria: prod.categoria
            }
        })

        console.log(productosMapeados)
        const schemaMasivo = Joi.array().items(schemaProductos);

        const { error, value: productosValidados } = schemaMasivo.validate(productosMapeados);

        if (error) {
            return res.status(400).json({
                error: "Hay un error en los datos del archivo.",
                detalle: error.details[0].message
            });
        }


        const cantidadInsertada = await ModelProductos.insertMany(productosValidados);



        return res.status(200).json({
            exito: true,
            mensaje: `¡Éxito! Se cargaron ${cantidadInsertada} productos a la base de datos.`,
        });

    } catch (error) {
        console.error("Error en la carga masiva:", error);
        return res.status(500).json({ error: "Error procesando el archivo" });
    }

}