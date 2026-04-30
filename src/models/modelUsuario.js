import { obtenerDb } from "../config/conexion.js"


const db = await obtenerDb()

class UsuarioModel {

    static async getAll() {
        const { rows } = await db.execute("SELECT * FROM usuarios");

        return rows
    }

    static async getbyId(id) {
        const { rows } = await db.execute({
            sql: "SELECT * FROM usuarios WHERE id = ?",
            args: [id]
        })
        return rows[0];
    }

    static async buscarEmail(email) {
        try {
            const { rows } = await db.execute({
                sql: "SELECT * FROM usuarios where email = ?",
                args: [email]
            })

            const firstEmail = rows[0]

            return firstEmail;
        } catch (err) {
            throw err
        }
    }
    static async createUser(data) {
        const { nombre, email, password, codigo_verificacion } = data
        const result = await db.execute({
            sql: "INSERT into usuarios(nombre,email,password,codigo_verificacion) VALUES(?,?,?,?)",
            args: [nombre, email, password, codigo_verificacion]
        })

        return result;
    }

    static async updatePasswordAndClearCode(id, nuevaPassword) {
        try {
            const result = await db.execute({
                // Actualizamos las DOS columnas separadas por una coma
                sql: "UPDATE usuarios SET password = ?, codigo_verificacion = NULL WHERE id = ?",
                args: [nuevaPassword, id]
            });

            // Si rowsAffected es mayor a 0, significa que lo encontró y lo actualizó
            return result.rowsAffected > 0;

        } catch (error) {
            console.error("Error al actualizar contraseña y limpiar código:", error);
            throw error;
        }
    }

    static async guardarCodigoVerificacion(id, codigoReseteo) {
        const query = `UPDATE usuarios SET codigo_verificacion = ? WHERE id = ?`
        const result = await db.execute({
            sql: query,
            args: [codigoReseteo, id]
        })
    }

    static async actualizarVerificado(id) {
        const result = await db.execute({
            sql: "UPDATE usuarios SET verificado = ?,codigo_verificacion = NULL where id = ?",
            args: [true, id]
        })

        return result;
    }

    static async getRol(id) {
        const result = await db.execute({
            sql: "SELECT rol FROM usuarios WHERE id = ?",
            args: [id]
        })

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].rol
    }

}

export default UsuarioModel