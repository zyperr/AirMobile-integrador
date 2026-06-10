import { obtenerDb } from "../config/conexion.js"
import { ROLES } from "../utils/roles.js";

const db = await obtenerDb()


class ModelStaff {
    static async obtenerStaff(filtros = {}) {
        try {
            let query = "SELECT * FROM usuarios WHERE rol = ?";
            const args = [ROLES.ADMIN]; // ROLES.ADMIN o el string que estés usando

            // Búsqueda Universal (Nombre o Email)
            if (filtros.buscar) {
                // Abrimos paréntesis para que el OR no rompa el WHERE principal
                query += " AND (nombre LIKE ? OR email LIKE ?)";

                const terminoBusqueda = `%${filtros.buscar}%`;
                // Empujamos el término dos veces (una para nombre, otra para email)
                args.push(terminoBusqueda, terminoBusqueda);
            }

            if (filtros.activo !== undefined) {
                const activoVal = (filtros.activo === 'true' || filtros.activo === '1') ? 1 : 0;
                query += " AND activo = ?";
                args.push(activoVal);
            }

            const { rows } = await db.execute({
                sql: query,
                args: args
            });

            return rows;
        } catch (error) {
            console.error("Error al obtener el staff desde turso:", error);
            throw error;
        }
    }
    static async actualizarDatosBasicos(id, data) {

        const keys = Object.keys(data)
        if (keys.length === 0) {
            return { success: false, message: "No hay datos para actualizar" };
        }

        const setDinamico = keys.map((key) => `${key} = ? `).join(', ');

        const argumentosDelSet = Object.values(data);

        argumentosDelSet.push(id)
        argumentosDelSet.push(ROLES.ADMIN)
        const query = `UPDATE usuarios SET ${setDinamico} WHERE id = ? and rol = ?`

        try {
            const result = await db.execute({
                sql: query,
                args: argumentosDelSet
            });

            if (result.rowsAffected === 0) {
                return { success: false, message: "No se ha encontrado el usuario" }
            }

            return { success: true, message: "Administrador actualizado correctamente" };
        } catch (error) {
            console.error("Erorr al actualizar el administrador: ", error);
            return { success: false, message: "Error interno del servidor" };
        }
    }
    static async verificarEmailExistente(email) {
        try {
            const query = `SELECT id FROM usuarios WHERE email = ?`;
            const { rows } = await db.execute({
                sql: query,
                args: [email]
            });
            // Retorna true si el email ya existe, false si está libre
            return rows.length > 0;
        } catch (error) {
            console.error("Error al verificar si el email del staff existe:", error);
            throw error;
        }
    }

    static async crearStaff(nombre, email, passwordEncriptada) {
        try {
            // El rol 'admin' queda hardcodeado directamente en el modelo por seguridad
            const query = `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`;
            const result = await db.execute({
                sql: query,
                args: [nombre, email, passwordEncriptada, ROLES.ADMIN]
            });
            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al crear el usuario staff:", error);
            throw error;
        }
    }

    static async darBajaStaff(id) {
        try {
            // Actualizamos la columna 'activo' a 0 (falso)
            // Mantenemos la regla de que solo afecte a usuarios con rol 'admin'
            const query = `UPDATE usuarios SET activo = 0 WHERE id = ? AND rol = ?`;
            const result = await db.execute({
                sql: query,
                args: [id, ROLES.ADMIN]
            });

            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al aplicar el borrado lógico al staff en Turso:", error);
            throw error;
        }
    }

    static async restaurarStaff(id) {
        try {
            // Volvemos a poner activo = 1
            const query = `UPDATE usuarios SET activo = 1 WHERE id = ? AND rol = ?`;
            const result = await db.execute({
                sql: query,
                args: [id, ROLES.ADMIN]
            });

            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al restaurar la cuenta del staff:", error);
            throw error;
        }
    }

    static async obtenerDatosBasicosPorId(id) {
        try {
            const query = `SELECT nombre, email FROM usuarios WHERE id = ? AND rol = ?`;
            const { rows } = await db.execute({
                sql: query,
                args: [id, ROLES.ADMIN] // Asumiendo que tenés tu constante ROLES importada
            });
            return rows[0]; // Retorna undefined si no lo encuentra
        } catch (error) {
            console.error("Error al obtener datos del staff:", error);
            throw error;
        }
    }

    static async actualizarPassword(id, passwordEncriptada) {
        try {
            // Requerimos que esté activo = 1. No tiene sentido blanquearle la clave a alguien dado de baja.
            const query = `UPDATE usuarios SET password = ? WHERE id = ? AND rol = ? AND activo = 1`;
            const result = await db.execute({
                sql: query,
                args: [passwordEncriptada, id, ROLES.ADMIN]
            });
            return result.rowsAffected > 0;
        } catch (error) {
            console.error("Error al blanquear contraseña en Turso:", error);
            throw error;
        }
    }
}

export default ModelStaff;