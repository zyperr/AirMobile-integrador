import ModelCarrito from "../models/modelCarrito.js";
import ModelProductos from "../models/modelProductos.js";

export const obtenerCarrito = async (req, res) => {

    try {
        const idUsuario = req?.user?.id;

        if (!idUsuario) {
            return res.status(401).json({
                exito: false,
                message: "Acceso denegado: Usuario no autenticado"
            });
        }

        const carrito = await ModelCarrito.getCarrito(idUsuario);

        return res.status(200).json({
            exito: true,
            data: carrito,
            message: "Se obtuvo carrito"
        });
    } catch (err) {
        console.error("Error en obtenerCarrito:", err);
        res.status(500).json({
            exito: false,
            message: "Error interno al obtener el carrito"
        });
    }

}
export const agregarAlCarrito = async (req, res) => {
    try {
        const cantidad = req.body?.cantidad || 1; 
        const capacidad = req.body?.capacidad || null; // <-- NUEVO: Extraemos la capacidad del body

        // 1. Validamos la cantidad
        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).json({ exito: false, message: "La cantidad debe ser un número mayor a 0" });
        }

        const idProducto = req.params.id;
        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ message: `No se ha encontrado el producto con el id: ${idProducto}` });
        }

        // 2. NUEVO: Validación de seguridad para la capacidad
        // Si el producto en la BD tiene capacidades configuradas, verificamos que el usuario haya mandado una válida
        if (producto.capacidad) {
            let capacidadesPermitidas = [];
            try {
                capacidadesPermitidas = typeof producto.capacidad === 'string' 
                    ? JSON.parse(producto.capacidad) 
                    : producto.capacidad;
            } catch (e) {
                capacidadesPermitidas = [];
            }

            // Si el producto requiere capacidad y el usuario no la envió:
            if (capacidadesPermitidas.length > 0 && !capacidad) {
                return res.status(400).json({ 
                    exito: false, 
                    message: "Debes seleccionar una capacidad disponible para este producto" 
                });
            }
        }

        const idUsuario = req?.user?.id;

        if (!idUsuario) {
            return res.status(401).json({ exito: false, message: "Acceso denegado: Usuario no autenticado" });
        }

        // 3. NUEVO: Le pasamos la capacidad como 4to argumento al modelo
        const resultadoCarrito = await ModelCarrito.addCarrito(idUsuario, idProducto, cantidad, capacidad);

        if (resultadoCarrito.error) {
            return res.status(400).json({ exito: false, message: resultadoCarrito.error });
        }

        return res.status(200).json({
            exito: true,
            message: "Producto agregado al carrito con éxito",
            detalle: resultadoCarrito.accion 
        });
    } catch (err) {
        console.error("Error al agregar al carrito:", err);
        res.status(500).json({ exito: false, message: "Error al agregar el producto al carrito" });
    }
};

export const eliminarProductoDelCarrito = async (req, res) => {
    try {
        const idProducto = req.params.id;
        // NUEVO: Extraemos la capacidad del body
        const capacidad = req.body?.capacidad || null;

        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ exito: false, message: `No se ha encontrado el producto con el id: ${idProducto}` });
        }

        const idUsuario = req?.user?.id;
        if (!idUsuario) {
            return res.status(401).json({ exito: false, message: "Acceso denegado: Usuario no autenticado" });
        }

        // NUEVO: Le pasamos la capacidad como 3er argumento al modelo
        const resultadoCarrito = await ModelCarrito.deleteProductFromCarrito(idUsuario, idProducto, capacidad);

        if (resultadoCarrito.error) {
            return res.status(400).json({ exito: false, message: resultadoCarrito.error });
        }

        res.status(200).json({
            exito: true,
            message: resultadoCarrito.message
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ exito: false, message: "Error al eliminar el producto del carrito" });
    }
};

// ELIMINA Todo un producto completo del carrito
export const eliminarProductoCompletoDelCarrito = async (req, res) => {
    try {
        const idProducto = req.params.id;
        // NUEVO: Extraemos la capacidad del body
        const capacidad = req.body?.capacidad || null;

        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ exito: false, message: `No se ha encontrado el producto con el id: ${idProducto}` });
        }

        const idUsuario = req?.user?.id;
        if (!idUsuario) {
            return res.status(401).json({ exito: false, message: "Acceso denegado: Usuario no autenticado" });
        }

        // NUEVO: Le pasamos la capacidad como 3er argumento al modelo
        const resultadoCarrito = await ModelCarrito.deleteAWholeProductFromCarrito(idUsuario, idProducto, capacidad);

        if (resultadoCarrito.error) {
            return res.status(400).json({ exito: false, message: resultadoCarrito.error });
        }

        res.status(200).json({
            exito: true,
            message: resultadoCarrito.message,
            accion: resultadoCarrito.accion, // retorna eliminar.
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ exito: false, message: "Error al eliminar el producto del carrito" });
    }
};


 // VACIA EL CARRITO COMPLETO DE UN USUARIO

 export const vaciarCarrito = async (req, res) => {
    try{
        const idUsuario = req?.user?.id;

        if(!idUsuario) {
            return res.status(401).json({ exito:false,message: "Acceso denegado: Usuario no autenticado" });
        }

        const resultadoCarrito = await ModelCarrito.emptyCarrito(idUsuario);

        if(resultadoCarrito.error) {
            return res.status(400).json({ exito:false,message: resultadoCarrito.error });
        }

        res.status(200).json({
            exito: true,
            message: resultadoCarrito.message,
        })
     }catch(err){
        console.error(err);
        res.status(500).json({ exito:false,message: "Error al vaciar el carrito" });
    }
}