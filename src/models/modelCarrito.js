import { obtenerDb } from "../config/conexion.js";


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

    static async addCarrito(usuarioId, productoId, cantidad) {

        try {
            const queryCheck = `
                SELECT id, cantidad 
                FROM carrito 
                WHERE usuario_id = ? AND producto_id = ?
            `;

            const checkResult = await db.execute({
                sql: queryCheck,
                args: [usuarioId, productoId]
            });
            if (checkResult.rows.length > 0) {
                //Calculamos la nueva cantidad
                const cantidadNueva = Number(checkResult.rows[0].cantidad);
                const nuevaCantidad = cantidadNueva + Number(cantidad);


                const queryUpdate = `
                    UPDATE carrito
                    SET cantidad = ?
                    WHERE usuario_id = ? AND producto_id = ?
                `;
                const resultUpdate = await db.execute({
                    sql: queryUpdate,
                    args: [nuevaCantidad, usuarioId, productoId]
                });
                return resultUpdate;

                //Si NO existe (el length es 0), lo insertamos por primera vez
            } else {

                const queryInsert = `
                INSERT INTO carrito (usuario_id, producto_id, cantidad)
                VALUES (?, ?, ?)
            `;
                const resultInsert = await db.execute({

                    sql: queryInsert,
                    args: [usuarioId, productoId, cantidad]
                });
                return { accion: "insertar", query: queryInsert, result: resultInsert };

            }

        } catch (error) {
            console.error("Error al agregar al carrito:", error);
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
    static async deleteAWholeProductFromCarrito(usuarioId, productoId) {
        try{
            const queryDelete = `
                DELETE FROM carrito
                WHERE usuario_id = ? AND producto_id = ?
            `;
            const resultDelete = await db.execute({
                sql: queryDelete,
                args: [usuarioId, productoId]
            });
            return {accion: "eliminar", message: "Se ha eliminado el producto del carrito.", result: resultDelete};
        }catch(error){
            console.error(`Error al eliminar ${productoId} del carrito:`, error);
            throw error;        
        }
    }
    static async deleteProductFromCarrito(usuarioId, productoId) {
        try {
            const queryCheck = `
                SELECT cantidad
                FROM carrito
                WHERE usuario_id = ? AND producto_id = ?
            `;

            const checkResult = await db.execute({
                sql: queryCheck,
                args: [usuarioId, productoId]
            });

            if (checkResult.rows.length === 0) {
                return { error: "El producto no existe en el carrito." };
            }

            const cantidadActual = Number(checkResult.rows[0].cantidad);

            if (cantidadActual > 1) {
                const queryUpdate = ` 
                    UPDATE carrito 
                    SET cantidad = ? 
                    WHERE usuario_id = ? AND producto_id = ?
                `;

                await db.execute({
                    sql: queryUpdate,
                    args: [cantidadActual-1,usuarioId, productoId]
                });

                return { accion: "reducir", message: "Se redujo la cantidad del producto en el carrito." };


            } else {
                const queryDelete = `
                 DELETE FROM carrito 
                 WHERE usuario_id = ? AND producto_id = ?
                `;

                await db.execute({
                    sql: queryDelete,
                    args: [usuarioId, productoId]
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