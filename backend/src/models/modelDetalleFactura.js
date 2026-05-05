import { obtenerDb } from "../config/conexion.js";


const db = await obtenerDb();



class ModelFactura {


    static async createDetalleFactura(facturaId, productoId, cantidad, precioUnitario) {
        try{
            const query = `INSERT INTO detalles_factura(factura_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`;
            const result = await db.execute({
                sql: query,
                args: [facturaId, productoId, cantidad, precioUnitario]
            });
            return result.rowsAffected > 0;

        }catch (error) {
            console.error("Error al crear el detalle de la factura:", error);
            throw error;
        }
    }

    static async getDetallesFacturaByFacturaId(facturaId) {
        try{
            const query = `
                SELECT 
                    df.id AS detalle_id,
                    df.cantidad,
                    df.precio_unitario,
                    p.id AS producto_id,
                    p.nombre_producto,
                    p.imagen_url
                FROM detalles_factura df
                INNER JOIN productos p ON df.producto_id = p.id
                WHERE df.factura_id = ?
            `;
            const {rows} = await db.execute({
                sql: query,
                args: [facturaId]
            });
            return rows;
        }catch (error) {
            console.error("Error al obtener los detalles de la factura:", error);
            throw error;
        }
    }
}



export default ModelFactura;