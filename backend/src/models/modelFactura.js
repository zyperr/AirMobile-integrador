import { obtenerDb } from "../config/conexion.js";


const db = await obtenerDb();



class ModelFactura {

    static async createFactura({ usuario_id, total, mp_payment_id, estado = 'Completado' }) {
        try {
            // 1. Agregamos mp_payment_id a la consulta SQL
            const query = `
                INSERT INTO facturas (usuario_id, total, mp_payment_id, estado) 
                VALUES (?, ?, ?, ?)
            `;

            const result = await db.execute({
                sql: query,
                args: [usuario_id, total, mp_payment_id, estado]
            });

            // 2. ¡LA MAGIA AQUÍ! Retornamos el ID de la fila recién insertada
            return Number(result.lastInsertRowid);

            /* Nota por si acaso: Si en su backend llegaran a estar usando MySQL clásico 
               en lugar de SQLite/Turso, cambiarías la línea de arriba por:
               return result.insertId;
            */

        } catch (error) {
            console.error("Error en el modelo al crear la factura:", error);
            throw error;
        }
    }

    static async getFacturaById(id) {
        try {
            const query = ` SELECT * FROM facturas WHERE id = ?`;
            const { rows } = await db.execute({
                sql: query,
                args: [id]
            })
            return rows[0];
        } catch (error) {
            console.error("Error al obtener la factura:", error);
            throw error;
        }
    }


    //Este metodo es para el admin, no se le pasa el usuario porque el admin puede ver todas las facturas
    static async getFacturas(limit, offset) {
        const query = `SELECT * FROM facturas ORDER BY fecha DESC 
    LIMIT ? OFFSET ?`;
        const { rows } = await db.execute({
            sql: query,
            args: [limit, offset]
        })
        return rows;
    }



    static async countFacturas() {
        try {
            const query = `SELECT COUNT(*) as total FROM facturas`;
            const { rows } = await db.execute({
                sql: query,
            });

            // rows[0] porque siempre devuelve una sola fila con el número
            return rows[0].total;
        } catch (error) {
            console.error("Error al contar las facturas:", error);
            throw error;
        }
    }

    static async updateEstadoFactura(facturaId, nuevoEstado) {
        try {
            const query = `
                UPDATE facturas 
                SET estado = ? 
                WHERE id = ?
            `;
            const result = await db.execute({
                sql: query,
                args: [nuevoEstado, facturaId]
            });
            return result;
        } catch (error) {
            console.error("Error al actualizar estado de la factura:", error);
            throw error;
        }
    }


    static async getFacturasDeUsuario(usuarioId, limit, offset) {
        try {
            const query = `SELECT * FROM facturas WHERE usuario_id = ? ORDER BY fecha DESC
            LIMIT ? OFFSET ?`;
            const { rows } = await db.execute({
                sql: query,
                args: [usuarioId, limit, offset]
            });
            return rows;
        } catch (error) {
            console.error("Error al obtener las facturas del usuario:", error);
            throw error;
        }
    }

    static async countFacturasDeUsuario(usuarioId) {
        try {
            const query = `SELECT COUNT(*) as total FROM facturas WHERE usuario_id = ?`;
            const { rows } = await db.execute({
                sql: query,
                args: [usuarioId]
            });

            // rows[0] porque siempre devuelve una sola fila con el número
            return rows[0].total;
        } catch (error) {
            console.error("Error al contar las facturas:", error);
            throw error;
        }
    }
}


export default ModelFactura