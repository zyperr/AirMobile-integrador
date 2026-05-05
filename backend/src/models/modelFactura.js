import { obtenerDb } from "../config/conexion.js";


const db = await obtenerDb();



class ModelFactura {

    static async createFactura(usuarioId, total) {
        try {
            const query = `
        INSERT INTO facturas (usuario_id, total)
        VALUES (?, ?)
        `;
            const result = await db.execute({
                sql: query,
                args: [usuarioId, total]
            });

            return Number(result.lastInsertRowid);
        } catch (error) {
            console.error("Error al crear la factura:", error);
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

    
    static async contarFacturas() {
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

    static async contarFacturasDeUsuario(usuarioId) {
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