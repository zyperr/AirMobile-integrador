import ModelCarrito from "../models/modelCarrito.js";
import ModelProductos from "../models/modelProductos.js";

export const obtenerCarrito = async (req, res) => {

    try {
        const idUsuario = req?.user?.id;

        if (!idUsuario) {
            return res.status(401).json({
                exito: false,
                error: "Acceso denegado: Usuario no autenticado"
            });
        }

        const carrito = await ModelCarrito.getCarrito(idUsuario);

        return res.status(200).json({
            exito: true,
            data: carrito
        });
    } catch (err) {
        console.error("Error en obtenerCarrito:", err);
        res.status(500).json({
            exito: false,
            error: "Error interno al obtener el carrito"
        });
    }

}
export const agregarAlCarrito = async (req, res) => {
    try {
        const cantidad = req.body.cantidad || 1; // Si no se especifica cantidad, se asume 1


        //Obtenemos la cantidad del body (si no viene, asumimos que quiere 1)
        if (isNaN(cantidad) || cantidad <= 0) {
            return res.status(400).json({ error: "La cantidad debe ser un número mayor a 0" });
        }

        const idProducto = req.params.id;
        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ message: `No se ha encontrado el producto con el id: ${idProducto}` });
        }

        const idUsuario = req?.user?.id;

        if (!idUsuario) {
            return res.status(401).json({ error: "Acceso denegado: Usuario no autenticado" });
        }

        const resultadoCarrito = await ModelCarrito.addCarrito(idUsuario, idProducto, cantidad);

        if (resultadoCarrito.error) {
            return res.status(400).json({ error: resultadoCarrito.error });
        }


        return res.status(200).json({
            exito: true,
            message: "Producto agregado al carrito",
            detalle: resultadoCarrito.accion //retorna insertado.
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al agregar el producto al carrito" });
    }


}

export const eliminarProductoDelCarrito = async (req, res) => {

    try {
        const idProducto = req.params.id;

        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ message: `No se ha encontrado el producto con el id: ${idProducto}` });
        }

        const idUsuario = req?.user?.id;
        if (!idUsuario) {
            return res.status(401).json({ error: "Acceso denegado: Usuario no autenticado" });
        }

        const resultadoCarrito = await ModelCarrito.deleteProductFromCarrito(idUsuario, idProducto);

        if (resultadoCarrito.error) {
            return res.status(400).json({ error: resultadoCarrito.error });
        }

        res.status(200).json({
            exito: true,
            message: resultadoCarrito.message
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar el producto del carrito" });
    }




   

}

 //ELIMINA Todo un producto completo del carrito
 export const eliminarProductoCompletoDelCarrito = async (req, res) =>{
    try{
        const idProducto = req.params.id;

        const producto = await ModelProductos.getById(idProducto);

        if (!producto) {
            return res.status(404).json({ message: `No se ha encontrado el producto con el id: ${idProducto}` });
        }

        const idUsuario = req?.user?.id;
        if(!idUsuario) {
            return res.status(401).json({ error: "Acceso denegado: Usuario no autenticado" });
        }


        const resultadoCarrito = await ModelCarrito.deleteAWholeProductFromCarrito(idUsuario, idProducto);

        if(resultadoCarrito.error) {
            return res.status(400).json({ error: resultadoCarrito.error });
        }

        res.status(200).json({
            exito: true,
            message: resultadoCarrito.message,
            accion: resultadoCarrito.accion, //retorna eliminar.
        })
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Error al eliminar el producto del carrito" });    
    }
 }


 // VACIA EL CARRITO COMPLETO DE UN USUARIO

 export const vaciarCarrito = async (req, res) => {
    try{
        const idUsuario = req?.user?.id;

        if(!idUsuario) {
            return res.status(401).json({ error: "Acceso denegado: Usuario no autenticado" });
        }

        const resultadoCarrito = await ModelCarrito.emptyCarrito(idUsuario);

        if(resultadoCarrito.error) {
            return res.status(400).json({ error: resultadoCarrito.error });
        }

        res.status(200).json({
            exito: true,
            message: resultadoCarrito.message,
        })
     }catch(err){
        console.error(err);
        res.status(500).json({ error: "Error al vaciar el carrito" });
    }
}