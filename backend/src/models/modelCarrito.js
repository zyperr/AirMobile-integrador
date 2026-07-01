import { obtenerDb } from "../config/conexion.js";


const db = await obtenerDb()


class ModelCarrito {
    static async getCarrito(usuarioId) {
        const query = `
        SELECT 
            carrito.id AS carrito_id,
            carrito.cantidad,
            carrito.capacidad,
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

static async addCarrito(usuarioId, productoId, cantidad, capacidad = null) {
    try {
        // 1. Buscamos si ya existe el mismo producto CON LA MISMA CAPACIDAD en el carrito
        const queryCheck = `
            SELECT id, cantidad 
            FROM carrito 
            WHERE usuario_id = ? AND producto_id = ? AND capacidad IS ?
        `;

        const checkResult = await db.execute({
            sql: queryCheck,
            args: [usuarioId, productoId, capacidad]
        });

        // Si YA existe, actualizamos su cantidad
        if (checkResult.rows.length > 0) {
            const cantidadNueva = Number(checkResult.rows[0].cantidad);
            const nuevaCantidad = cantidadNueva + Number(cantidad);

            const queryUpdate = `
                UPDATE carrito
                SET cantidad = ?
                WHERE usuario_id = ? AND producto_id = ? AND capacidad IS ?
            `;
            
            const resultUpdate = await db.execute({
                sql: queryUpdate,
                args: [nuevaCantidad, usuarioId, productoId, capacidad]
            });
            
            // Retornamos un objeto con la acción para que tu controlador reciba el .accion correctamente
            return { accion: "actualizar", result: resultUpdate };

        // Si NO existe, lo insertamos por primera vez incluyendo la capacidad seleccionada
        } else {
            const queryInsert = `
                INSERT INTO carrito (usuario_id, producto_id, cantidad, capacidad)
                VALUES (?, ?, ?, ?)
            `;
            
            const resultInsert = await db.execute({
                sql: queryInsert,
                args: [usuarioId, productoId, cantidad, capacidad]
            });
            
            return { accion: "insertar", query: queryInsert, result: resultInsert };
        }

    } catch (error) {
        console.error("Error al agregar al carrito en el modelo:", error);
        throw error;
    }
}


    static async emptyCarrito(usuarioId) {
        try {
            const queryDelete = `
                DELETE FROM carrito
                WHERE usuario_id = ?
            `;
            const resultDelete = await db.execute({
                sql: queryDelete,
                args: [usuarioId]
            });
            
            return {resultDelete, message: "Carrito vaciado correctamente."};
            
        } catch (error) {
            console.error("Error al vaciar el carrito:", error);
            throw error;        
        }
    }
    static async deleteAWholeProductFromCarrito(usuarioId, productoId, capacidad = null) {
        try {
            const queryDelete = `
                DELETE FROM carrito
                WHERE usuario_id = ? AND producto_id = ? AND capacidad IS ?
            `;
            const resultDelete = await db.execute({
                sql: queryDelete,
                args: [usuarioId, productoId, capacidad]
            });
            return { accion: "eliminar", message: "Se ha eliminado el producto del carrito.", result: resultDelete };
        } catch (error) {
            console.error(`Error al eliminar ${productoId} del carrito:`, error);
            throw error;
        }
    }

    static async deleteProductFromCarrito(usuarioId, productoId, capacidad = null) {
        try {
            const queryCheck = `
                SELECT cantidad
                FROM carrito
                WHERE usuario_id = ? AND producto_id = ? AND capacidad IS ?
            `;

            const checkResult = await db.execute({
                sql: queryCheck,
                args: [usuarioId, productoId, capacidad]
            });

            if (checkResult.rows.length === 0) {
                return { error: "El producto no existe en el carrito." };
            }

            const cantidadActual = Number(checkResult.rows[0].cantidad);

            if (cantidadActual > 1) {
                const queryUpdate = ` 
                    UPDATE carrito 
                    SET cantidad = ? 
                    WHERE usuario_id = ? AND producto_id = ? AND capacidad IS ?
                `;

                await db.execute({
                    sql: queryUpdate,
                    args: [cantidadActual - 1, usuarioId, productoId, capacidad]
                });

                return { accion: "reducir", message: "Se redujo la cantidad del producto en el carrito." };

            } else {
                const queryDelete = `
                 DELETE FROM carrito 
                 WHERE usuario_id = ? AND producto_id = ? AND capacidad IS ?
                `;

                await db.execute({
                    sql: queryDelete,
                    args: [usuarioId, productoId, capacidad]
                });

                return { accion: "eliminar", message: "Se ha eliminado el producto del carrito." };
            }
        } catch (error) {
            console.error("Error al eliminar del carrito:", error);
            throw error;
        }
    }
}   

export default ModelCarrito;