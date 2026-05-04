import { obtenerDb } from "../config/conexion.js"

const db = await obtenerDb()


class ModelProductos {
    static async getAll(filtros) {

        try {
            let sql = "SELECT * FROM productos WHERE 1=1"
            let args = []

            if (filtros.categoria) {
                sql += " AND categoria LIKE ?"
                args.push(`%${filtros.categoria}%`)
            }

            if(filtros.condicion){
                sql += " AND condicion LIKE ?"
                args.push(`%${filtros.condicion}%`)
            }

            if (filtros.precioMin) {
                sql += " AND precio >= ?";
                args.push(Number(filtros.precioMin));
            }

            // 3. Filtro por precio máximo
            if (filtros.precioMax) {
                sql += " AND precio <= ?";
                args.push(Number(filtros.precioMax));
            }

            // 4. Filtro por búsqueda de nombre (Coincidencia parcial con LIKE)
            if (filtros.busqueda) {
                sql += " AND nombre_producto LIKE ?";
                // Los % indican que puede haber cualquier texto antes o después de la palabra buscada
                args.push(`%${filtros.busqueda}%`);
            }

            const result = await db.execute({
                sql: sql,
                args: args
            });
            return result.rows
        } catch (err) {
            console.error("Error en ProductoModel.getAll:", err);
            throw err;
        }
    }

    static async getById(id) {
        const { rows } = await db.execute({
            sql: "SELECT * FROM productos WHERE id = ?",
            args: [id]
        })

        return rows[0]
    }

    static async createProduct(data) {
        const { nombre_producto, precio, categoria, condicion } = data
        const capacidad = JSON.stringify(data.capacidad)
        const result = await db.execute({
            sql: "INSERT INTO productos(nombre_producto,precio,capacidad,descripcion,imagen_url,categoria,condicion) VALUES(?,?,?,?,?,?,?)",
            args: [nombre_producto, precio, capacidad ? capacidad : "", data.descripcion ? data.descripcion : "", data.imagen_url ? data.imagen_url : "", categoria, condicion]
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

    static async updateProduct(id, data) {
        const keys = Object.keys(data)
        if (keys.length === 0) {
            return { success: false, message: "No hay datos para actualizar" };
        }

        const setDinamico = keys.map((key) => `${key} = ? `).join(', ');

        const argumentosDelSet = Object.values(data);


        argumentosDelSet.push(id)
        const query = `UPDATE productos SET ${setDinamico} WHERE id = ?`
        try {
            const result = await db.execute({
                sql: query,
                args: argumentosDelSet
            });

            if (result.rowsAffected === 0) {
                return { success: false, message: "No se ha encontrado el producto" }
            }

            return { success: true, message: "Producto actualizado correctamente" };

        } catch (err) {
            console.error("Erorr al actualizar el producto: ", err);
            return { success: false, message: "Error interno del servidor" };
        }
    }
}

export default ModelProductos