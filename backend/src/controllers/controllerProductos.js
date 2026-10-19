import ModelProductos from "../models/modelProductos.js";
import UsuarioModel from "../models/modelUsuario.js";
import { schemaProductos } from "../schemas/schemaProductos.js";
import { schemaFiltrosProductos } from "../schemas/schemaQueriesFiltros.js";
import { schemaActualizarProducto } from "../schemas/schemaUpdateProducto.js";
import { procesarArchivo } from "../utils/leerArchivos.js";
import { ROLES } from "../utils/roles.js";
import { eliminarDeCloudinary, subirACloudinary, extraerPublicId, borrarImagenesDescartadas } from "../utils/manejarImagenes.js";
import Joi from "joi";
import cloudinary from "../config/cloudinarySetup.js";

export const obtenerProductos = async (req, res) => {
    const { error, value } = schemaFiltrosProductos.validate(req.query);

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
            capacidad: value.capacidad,
            precioMin: value.precioMin,
            precioMax: value.precioMax,
            busqueda: value.busqueda,
            orden: value.orden,
            bateriaMin: value.bateriaMin
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
                imagen_url: JSON.parse(producto.imagen_url),
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

        return res.status(500).json({ message: "Error interno del servidor" });
    }
}


export const obtenerProducto = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) {
            return res.status(400).json({ exito: false, message: "No se ha proporcionado un id" })
        }

        const producto = await ModelProductos.getById(id);

        if (!producto) {
            return res.status(404).json({ exito: false, message: `No se ha encontrado el producto con el id: ${id}` })
        }

        const parsedProducto = {
            ...producto,
            imagen_url: JSON.parse(producto.imagen_url),
            capacidad: JSON.parse(producto.capacidad)
        }
        return res.status(200).json({ data: parsedProducto, exito: true })

    } catch (err) {
        console.error(err)
        res.status(500).json({ exito: false, message: "Error al obtener el producto" })
    }
}

export const crearProducto = async (req, res) => {
    try {
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
            precio: Number(req.body.precio),
            capacidad: capacidadArreglo,
            imagen_url: urlsImagenes.length > 0 ? urlsImagenes : []
        };

        

        const { error, value } = schemaProductos.validate(datosAValidar, { abortEarly: false });
        
        if (error) {

            if (urlsImagenes.length > 0) {
                await Promise.all(urlsImagenes.map(url => eliminarDeCloudinary(url)))
            }
            const erroresLimpios = error.details.map(detalle => detalle.message);
            return res.status(400).json({
                exito: false,
                message: `Por favor, corrige los siguientes errores: ${erroresLimpios.join(', ')}`,
                errores: erroresLimpios
            });
        };

        const product = await ModelProductos.createProduct(value)


        return res.status(200).json({ exito: true, message: "Producto creado con exito", data: product })

    } catch (err) {
        console.error(err)

        return res.status(500).json({ exito: false, message: "Error al crear el producto" })
    }
}

export const actualizarProducto = async (req, res) => {

    const { error, value } = schemaActualizarProducto.validate(req.body, { abortEarly: false });

    if (error) {
        const erroresLimpios = error.details.map(detalle => detalle.message);
        console.log("❌ JOI RECHAZÓ LOS DATOS POR ESTO:", erroresLimpios);
        return res.status(400).json({
            exito: false,
            message: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    };

    try {
        let dataParaActualizar = { ...value };
        const idProducto = req.params.id;

        if (dataParaActualizar.capacidad) {
            dataParaActualizar.capacidad = JSON.stringify(dataParaActualizar.capacidad);
        }

        // 1. OBTENEMOS EL PRODUCTO VIEJO
        const productoViejo = await ModelProductos.getById(idProducto);
        if (!productoViejo) {

            return res.status(404).json({ exito: false, message: "Producto no encontrado" });
        }

        // 2. LÓGICA DE IMÁGENES (Solo si subieron fotos nuevas)
        if (req.body?.layout_imagenes) {
            const layout = JSON.parse(req.body.layout_imagenes);

            await borrarImagenesDescartadas(req.body.layout_imagenes, productoViejo.imagen_url);

            // 2. SUBIDA Y REORDENAMIENTO
            const categoriaFinal = dataParaActualizar.categoria || productoViejo.categoria;
            const nombreFinal = dataParaActualizar.nombre_producto || productoViejo.nombre_producto;

            const nuevasImagenesUrls = [];
            let fileIndex = 0; 

            for (const item of layout) {
                if (item === 'NUEVA_IMAGEN' && req.files[fileIndex]) {
                    const file = req.files[fileIndex++];
                    // Tu otra función útil en acción
                    const url = await subirACloudinary(file.buffer, categoriaFinal, nombreFinal);
                    nuevasImagenesUrls.push(url);
                } else {
                    nuevasImagenesUrls.push(item);
                }
            }

            dataParaActualizar.imagen_url = JSON.stringify(nuevasImagenesUrls);
        }

        if (dataParaActualizar.layout_imagenes) {
            delete dataParaActualizar.layout_imagenes;
        }

        // --- ¡CLAVE 2! Si después de todo, el objeto está vacío, no hacemos el UPDATE ---
        if (Object.keys(dataParaActualizar).length === 0) {
            return res.status(200).json({
                productoActualizado: productoViejo,
                exito: true,
                message: "No hubo cambios para guardar."
            });
        }

        const result = await ModelProductos.updateProduct(idProducto, dataParaActualizar);

        if (!result.success) {
            return res.status(404).json({ exito: false, message: result.message });
        }

        return res.status(200).json({
            productoActualizado: dataParaActualizar,
            exito: true,
            message: "El producto se actualizó con éxito"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ exito: false, message: "Error al actualizar un producto" });
    }
};


export const eliminarProducto = async (req, res) => {
    try {
        const idProducto = req.params.id;
        const productoAEliminar = await ModelProductos.deleteProduct(idProducto);

        if (!productoAEliminar) {
            return res.status(404).json({ exito: false, message: `No se ha encontrado el producto con el id: ${idProducto}` })
        }

        return res.status(200).json({ productoAEliminar, exito: true, message: "Se elimino con exito el producto" });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ exito: false, message: "Error al eliminar un producto" })
    }
}

export const obtenerProductosAdmin = async (req, res) => {
    const { error, value } = schemaFiltrosProductos.validate(req.query);

    if (error) {
        return res.status(400).json({ exito: false, error: error.details[0].message });
    }
    try {
        const filtros = {
            categoria: value.categoria,
            condicion: value.condicion,
            capacidad: value.capacidad,
            precioMin: value.precioMin,
            precioMax: value.precioMax,
            busqueda: value.busqueda,
            orden: value.orden,
            bateriaMin: value.bateriaMin
        };

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;

        const [productos, totalResultados] = await Promise.all([
            ModelProductos.getAllAdmin(filtros, limit, offset),
            ModelProductos.countAllAdmin(filtros)
        ]);

        const totalPaginas = Math.ceil(totalResultados / limit);

        const productosParseados = productos.map((producto) => ({
            ...producto,
            imagen_url: JSON.parse(producto.imagen_url),
            capacidad: JSON.parse(producto.capacidad)
        }))

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
            data: productosParseados
        });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ exito: false, message: "Error interno del servidor" });
    }
}

export const restaurarProducto = async (req, res) => {
    try {
        const idProducto = req.params.id;
        const resultado = await ModelProductos.restoreProduct(idProducto);

        if (!resultado.success) {
            return res.status(404).json({ exito: false, message: resultado.message });
        }

        return res.status(200).json({ exito: true, message: "Se restauró correctamente el producto" });
    } catch (err) {
        console.error(err)
        return res.status(500).json({ exito: false, message: "Error al restaurar el producto" });
    }
}

export const bulkUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, message: "Por favor, subí un archivo." });
        }

        const extension = req.file.originalname.split('.').pop().toLowerCase();
        const separadorCSV = req.body.separator || ',';

        const productosArray = await procesarArchivo(req.file.buffer, extension, separadorCSV);

        // Convierte "128GB|256GB" o "128GB | 256GB" → ["128GB", "256GB"]
        const parsearPipeList = (valor) => {
            if (!valor) return [];
            if (Array.isArray(valor)) return valor.map(s => s.trim()).filter(Boolean);
            return String(valor).split("|").map(s => s.trim()).filter(Boolean);
        };

        const categoriasSinCapacidad = ["auriculares", "cargadores", "cables", "powerbanks", "fundas", "protectores", "accesorios", "relojes"];

        const productosMapeados = productosArray.map(prod => {
            const categoria = prod.categoria?.trim();
            const sinCapacidad = categoriasSinCapacidad.includes(categoria);

            const producto = {
                nombre_producto: prod.nombre_producto?.trim(),
                categoria,
                precio: Number(prod.precio),
                condicion: prod.condicion?.trim(),
                descripcion: prod.descripcion?.trim() || undefined,
                imagen_url: parsearPipeList(prod.imagen_url),
                // capacidad solo si aplica y tiene valor
                ...(!sinCapacidad && prod.capacidad
                    ? { capacidad: parsearPipeList(prod.capacidad) }
                    : {}),
                // bateria solo si aplica y tiene valor
                ...(!sinCapacidad && prod.bateria
                    ? { bateria: Number(prod.bateria) }
                    : {}),
            };

            return producto;
        });


        const schemaMasivo = Joi.array().items(schemaProductos);
        const { error, value: productosValidados } = schemaMasivo.validate(productosMapeados, { abortEarly: true });

        if (error) {
            return res.status(400).json({
                exito: false,
                message: "Hay un error en los datos del archivo.",
                detalle: error.details[0].message
            });
        }

        const cantidadInsertada = await ModelProductos.insertMany(productosValidados);

        return res.status(200).json({
            exito: true,
            message: `Carga completada: ${cantidadInsertada} productos procesados (nuevos + actualizados).`,
        });

    } catch (error) {
        console.error("Error en la carga masiva:", error);
        return res.status(500).json({ exito: false, message: "Error procesando el archivo" });
    }
};
