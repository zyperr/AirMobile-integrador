import { obtenerDb } from "../config/conexion.js";


const db = await obtenerDb();



class ModelListaDeseados {
    static async addWishList(usuarioId, productoId) {
        try {
            // Usamos INSERT OR IGNORE para que si ya existe, no haga nada
            // y no tire error de "Unique Constraint".
            const query = `INSERT OR IGNORE INTO lista_deseados (usuario_id, producto_id) VALUES (?, ?)`;

            const result = await db.execute({
                sql: query,
                args: [usuarioId, productoId]
            });

            // Si rowsAffected es 0, significa que el producto ya estaba en la lista (se ignoró el insert)
            return result.rowsAffected > 0;

        } catch (err) {
            console.error("Error al agregar a la lista de deseados:", err);
            throw err;
        }
    }

    static async getWishListByUserId(usuarioId) {
        try {
            const query = `
                SELECT 
                    p.id AS producto_id,
                    p.nombre_producto,
                    p.precio,
                    p.condicion,
                    p.imagen_url,
                    p.capacidad 
                FROM lista_deseados ld
                INNER JOIN productos p ON ld.producto_id = p.id
                WHERE ld.usuario_id = ?
            `;

            const { rows } = await db.execute({
                sql: query,
                args: [usuarioId]
            });

            return rows;
        } catch (err) {
            console.error("Error al obtener la lista de deseados:", err);
            throw err;
        }
    }

    static async removeWishList(usuarioId, productoId) {
        try {
            const query = `DELETE FROM lista_deseados WHERE usuario_id = ? AND producto_id = ?`;
            const result = await db.execute({
                sql: query,
                args: [usuarioId, productoId]
            });

            // Si rowsAffected es 0, significa que el producto no estaba en la lista (no se eliminó nada)

            return result.rowsAffected > 0; // Retorna true si se eliminó, false si no se encontró
        } catch (err) {
            console.error("Error al eliminar de la lista de deseados:", err);
            throw err;
        }
    }

    static async countWishListByUserId(usuarioId) {

        try{
            const query = `SELECT COUNT(*) AS total from lista_deseados WHERE usuario_id = ?`;
            const args = [usuarioId];

            const result = await db.execute({
                sql: query,
                args: args
            });

            
            return result.rows[0].total;

        }catch(err){
            console.error("Error al contar la lista de deseados:", err);
            throw err;
        }

    }
    static async isProductInWishList(usuarioId, productoId) {
    try {
        const query = `SELECT 1 FROM lista_deseados WHERE usuario_id = ? AND producto_id = ? LIMIT 1`;
        const { rows } = await db.execute({
            sql: query,
            args: [usuarioId, productoId]
        });
        return rows.length > 0; // Devuelve true si existe, false si no
    } catch (err) {
        console.error("Error verificando existencia en deseos:", err);
        throw err;
    }
}
}


export default ModelListaDeseados;


