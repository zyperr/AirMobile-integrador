import ModelProductos from "../models/modelProductos.js";
import UsuarioModel from "../models/modelUsuario.js";
import { schemaProductos } from "../schemas/schemaProductos.js";
import { schemaFiltrosProductos } from "../schemas/schemaQueriesFiltros.js";
import { schemaActualizarProducto } from "../schemas/schemaUpdateProducto.js";
import { procesarArchivo } from "../utils/leerArchivos.js";
import { ROLES } from "../utils/roles.js";
import { eliminarDeCloudinary, subirACloudinary } from "../utils/manejarImagenes.js";
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
            condicion: value.condicion,
            precioMin: value.precioMin,
            precioMax: value.precioMax,
            busqueda: value.busqueda,
            orden:value.orden
        };



        // El offset se calcula restando 1 a la página actual y multiplicándola por el límite de resultados por página. Esto asegura que se salten los resultados de las páginas anteriores.
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [productos, totalResultados] = await Promise.all([
            ModelProductos.getAll(filtros, limit, offset),
            ModelProductos.countProductos(filtros)
        ]);

        const totalPaginas = Math.ceil(totalResultados / limit);




        const productosParseados = productos.map((producto) => {
            return {
                ...producto,
                imagen_url:JSON.parse(producto.imagen_url),
                capacidad: JSON.parse(producto.capacidad)
            }
        })



        return res.status(200).json({
            exito: true,
            paginacion: { // Agrupamos todo en un objeto para que sea más ordenado para el frontend
                paginaActual: page,
                limitePorPagina: limit,
                totalResultados: totalResultados,
                totalPaginas: totalPaginas,
                tienePaginaSiguiente: page < totalPaginas,
                tienePaginaAnterior: page > 1
            },
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
            imagen_url:JSON.parse(producto.imagen_url),
            capacidad: JSON.parse(producto.capacidad)
        }
        return res.status(200).json(parsedProducto)

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Error al obtener el producto" })
    }
}

export const crearProducto = async (req, res) => {


    try {
        const idUsuario = req?.user?.id

        if (!idUsuario) {
            return res.status(401).json({ message: "Creedenciales invalidas" })
        }
        const rol = await UsuarioModel.getRol(idUsuario)

        if (rol !== ROLES.ADMIN) {
            return res.status(403).json({ message: "El usuario no tiene permisos para esto" })

        }


        let urlsImagenes = [];
        // req.files existe si en la ruta usaste multer.array('imagenes', 5)
        if (req.files && req.files.length > 0) {
            // Subimos todas las imágenes en paralelo y guardamos las URLs resultantes
            urlsImagenes = await Promise.all(
                req.files.map(file => subirACloudinary(file.buffer, req.body.categoria, req.body.nombre_producto))
            );
        }
        let capacidadArreglo = [];
        
        if (req.body.capacidad) {
            try {
                // Intentamos leerlo como un JSON '["64GB", "128GB"]'
                capacidadArreglo = JSON.parse(req.body.capacidad);
            } catch (error) {
                // Si falla el parseo (ej: mandaron "128GB" sin corchetes), 
                // lo convertimos nosotros en un arreglo manualmente o lo separamos por comas.
                if (typeof req.body.capacidad === 'string' && req.body.capacidad.includes(',')) {
                    capacidadArreglo = req.body.capacidad.split(',').map(item => item.trim());
                } else {
                    capacidadArreglo = [req.body.capacidad];
                }
            }
        }


        const datosAValidar = {
            ...req.body,
            capacidad: capacidadArreglo,
            imagen_url: urlsImagenes.length > 0 ? urlsImagenes : []
        };


        const { error, value } = schemaProductos.validate(datosAValidar, { abortEarly: false });
        console.log(urlsImagenes)
        if (error) {

            if (urlsImagenes.length > 0) {
                await Promise.all(urlsImagenes.map(url => eliminarDeCloudinary(url)))
            }
            const erroresLimpios = error.details.map(detalle => detalle.message);
            return res.status(400).json({
                exito: false,
                mensaje: "Por favor, corrige los siguientes errores:",
                errores: erroresLimpios
            });
        };

        const product = await ModelProductos.createProduct(value)


        return res.status(200).json({ message: "Producto creado con exito", data: product })

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

        const idUsuario = req?.user?.id
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


export const eliminarProducto = async (req, res) => {
    try {

        const idUsuario = req?.user?.id;

        if (!idUsuario) {
            return res.status(401).json({ message: "Credenciales invalidas" })
        }

        const rol = await UsuarioModel.getRol(idUsuario);

        if (rol !== ROLES.ADMIN) {
            return res.status(403).json({ message: "El usuario no tiene permisos para esto" });
        }

        const idProducto = req.params.id;
        const productoAEliminar = await ModelProductos.deleteProduct(idProducto);

        if (!productoAEliminar) {
            return res.status(404).json({ message: `No se ha encontrado el producto con el id: ${idProducto}` })
        }

        return res.status(200).json(productoAEliminar);
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Error al eliminar un producto" })
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
                nombre_producto: prod.nombre_producto || prod.nombre,
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
