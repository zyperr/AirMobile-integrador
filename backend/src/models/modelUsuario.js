import { obtenerDb } from "../config/conexion.js"


const db = await obtenerDb()

class UsuarioModel {

    static async getAll() {
        const { rows } = await db.execute("SELECT * FROM usuarios WHERE activo = 1");

        return rows
    }

    static async getbyId(id) {
        const { rows } = await db.execute({
            sql: "SELECT * FROM usuarios WHERE id = ? AND activo = 1",
            args: [id]
        })
        return rows[0];
    }

    static async buscarEmail(email) {
        try {
            const { rows } = await db.execute({
                sql: "SELECT * FROM usuarios where email = ? AND activo = 1",
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


    static async updateUserPassword(id, passwordHash) {
        try {
            const query = `UPDATE usuarios SET password = ? WHERE id = ?`;

            const result = await db.execute({
                sql: query,
                args: [passwordHash, id] // IMPORTANTE: Este debe ser el hash, no la contraseña plana
            });

            // Retorna true si modificó la fila, false si no encontró el ID
            return result.rowsAffected > 0;

        } catch (error) {
            console.error("Error al actualizar la contraseña en la BD:", error);
            throw error; // Lanzamos el error para que el controlador lo atrape y envíe el status 500
        }
    }
    static async updatePasswordClearCodeVerificate(email, nuevaPassword, codigoIngresado) {
        const queryActualizar = `
            UPDATE usuarios 
            SET 
                password = ?, 
                verificado = 'verdadero', 
                codigo_verificacion = NULL 
            WHERE email = ? AND codigo_verificacion = ?
        `;
        try {
            const result = await db.execute({
                sql: queryActualizar,
                args: [nuevaPassword, email, codigoIngresado]
            })

            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al actualizar contraseña y limpiar código:", error);
            throw error;
        }
    }

    static async guardarCodigoVerificacion(id, codigoReseteo) {
        // Agregamos "verificado = 0" a la consulta SQL
        const query = `UPDATE usuarios SET codigo_verificacion = ?, verificado = 0 WHERE id = ?`
        const result = await db.execute({
            sql: query,
            args: [codigoReseteo, id]
        })
    }

    static async actualizarVerificado(id) {
        const result = await db.execute({
            sql: "UPDATE usuarios SET verificado = 1,codigo_verificacion = NULL where id = ?",
            args: [id]
        })

        return result;
    }

    static async getRol(id) {
        const result = await db.execute({
            sql: "SELECT rol FROM usuarios WHERE id = ? AND activo = 1",
            args: [id]
        })

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].rol
    }

    static async actualizarNombre(id, nuevoNombre) {
        try {
            const query = `UPDATE usuarios SET nombre = ? WHERE id = ?`;
            const result = await db.execute({
                sql: query,
                args: [nuevoNombre, id]
            });

            // rowsAffected nos dirá si realmente se modificó alguna fila
            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al actualizar el nombre en la BD:", error);
            throw error;
        }
    }

    static async actualizarCorreo(id, nuevoCorreo) {
        try {
            const query = `UPDATE usuarios SET email = ? WHERE id =?`;
            const result = await db.execute({
                sql: query,
                args: [nuevoCorreo, id]
            })
            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al actualizar el correo en la BD:", error);
            throw error;
        }

    }

}

export default UsuarioModel