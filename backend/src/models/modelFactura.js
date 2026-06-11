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
    static async obtenerEstadisticas() {
        try {
            const sql = `
            SELECT 
                COALESCE(SUM(total), 0) AS totalFacturado,
                COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN total ELSE 0 END), 0) AS totalPendiente,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS cantidadPendientes,
                COUNT(CASE WHEN strftime('%Y-%m', fecha) = strftime('%Y-%m', 'now') THEN 1 END) AS facturasDelMes
            FROM facturas
        `;

            const { rows } = await db.execute({ sql });

            return rows[0];
        } catch (error) {
            console.error("Error en ModelFactura.obtenerEstadisticas:", error);
            throw error;
        }
    }
    static buildWhereClause(filtros) {
        let where = "WHERE 1=1"; // Truco clásico de SQL para ir concatenando 'AND' fácilmente
        const args = [];

        if (filtros.buscar) {
            // Ajustá 'nombre_cliente' al nombre real de tu columna en la DB
            where += " AND nombre_cliente LIKE ?";
            args.push(`%${filtros.buscar}%`);
        }

        if (filtros.estado) {
            where += " AND estado = ?";
            args.push(filtros.estado);
        }

        if (filtros.total) {
            where += " AND total = ?";
            args.push(filtros.total);
        }

        if (filtros.fecha) {
            // SQLite/Turso maneja las fechas como texto, DATE() extrae solo la porción YYYY-MM-DD
            where += " AND DATE(fecha) = DATE(?)";
            args.push(filtros.fecha);
        }

        return { where, args };
    }

    static async countFacturas(filtros) {
        const { where, args } = this.buildWhereClause(filtros);

        const query = `SELECT COUNT(*) as total FROM facturas ${where}`;

        const { rows } = await db.execute({
            sql: query,
            args
        });

        // Retornamos el total directamente
        return rows[0].total;
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