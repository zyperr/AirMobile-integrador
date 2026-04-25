import ModelProductos from "../models/modelProductos.js";
import { schemaProductos } from "../schemas/schemaProductos.js";


export const obtenerProductos = async (req, res) => {
    try {
        const productos = await ModelProductos.getAll();
        const productosParseados = productos.map((producto) =>{
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

        const product = await ModelProductos.createProduct(value)


        return res.status(200).json({message:"Producto creado con exito" })

    } catch (err) {
        console.error(err)

        return res.status(500).json({ error: "Error al crear el producto" })
    }
}
