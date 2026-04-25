import { obtenerDb } from "../config/conexion";


const db = await obtenerDb()


class ModelCarrito {
    static async getCarrito(usuarioId) {
        const query = `
        SELECT 
            carrito.id AS carrito_id,
            carrito.cantidad,
            productos.id AS producto_id,
            productos.nombre_producto,
            productos.precio,
            productos.imagen_url
        FROM carrito
        INNER JOIN productos ON carrito.producto_id = productos.id
        WHERE carrito.usuario_id = ?
    `;
        try {
            const result = await db.execute({
                sql: query,
                args: [usuarioId]
            });

            return result.rows; // Esto devuelve el arreglo con todos los productos del carrito
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            throw error;
        }
    }
}