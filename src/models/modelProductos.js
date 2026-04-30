import { obtenerDb } from "../config/conexion.js"

const db = await obtenerDb()


class ModelProductos {
    static async getAll() {
        const { rows } = await db.execute("SELECT * FROM productos");
        return rows
    }

    static async getById(id) {
        const { rows } = await db.execute({
            sql: "SELECT * FROM productos WHERE id = ?",
            args: [id]
        })

        return rows[0]
    }

    static async createProduct(data) {
        const { nombre_producto, precio, categoria,condicion } = data
        const capacidad = JSON.stringify(data.capacidad)
        const result = await db.execute({
            sql: "INSERT INTO productos(nombre_producto,precio,capacidad,descripcion,imagen_url,categoria,condicion) VALUES(?,?,?,?,?,?,?)",
            args: [nombre_producto,precio,capacidad ? capacidad : "", data.descripcion ? data.descripcion : "",data.imagen_url ?data.imagen_url : "", categoria,condicion]
        })

        return result;
    }

    static async deleteProduct(id) {
        try {
            const result = await db.execute({
                sql: "DELETE FROM productos WHERE id = ?",
                args: [id]
            })


            if (result.rowsAffected === 0) {
                return { success: false, message: "No se ha encontrado el producto" }
            }
            return { success: true, message: "Se ha eliminado correctamente" }
        } catch (err) {
            console.error("Error al eliminar producto:", err);
            return { success: false, message: "Error interno del servidor" }
        }

    }
}

export default ModelProductos