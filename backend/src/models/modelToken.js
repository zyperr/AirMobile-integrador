import { obtenerDb } from "../config/conexion.js";

const db = await obtenerDb()

class TokenModel {
    static async guardarRefreshToken(refreshToken, idUsuario, fechaExpiracionStr) {
        try {
            const query = `
            INSERT INTO refresh_tokens (usuario_id, refresh_token, fecha_expiracion)
            VALUES (?, ?, ?)
        `;
            console.log(refreshToken, fechaExpiracionStr)
            const resultado = await db.execute({
                sql: query,
                args: [idUsuario, refreshToken, fechaExpiracionStr]
            });

            return resultado.rowsAffected > 0;

        } catch (error) {
            console.error("Error en la base de datos al guardar Refresh Token:", error);
            throw error;
        }
    }

    static async buscarRefreshToken(refreshToken) {
        try {
            const query = `SELECT * FROM refresh_tokens WHERE refresh_token = ? LIMIT 1`;
            const resultado = await db.execute({
                sql: query,
                args: [refreshToken]
            });

            // Turso devuelve un array 'rows'. Retornamos el primer elemento o null
            return resultado.rows.length > 0 ? resultado.rows[0] : null;
        } catch (error) {
            console.error("Error al buscar Refresh Token:", error);
            throw error;
        }
    }
    static async revocarRefreshToken(refreshToken) {
        try {
            const query = `UPDATE refresh_tokens SET revocado = 1 WHERE refresh_token = ?`;
            await db.execute({
                sql: query,
                args: [refreshToken]
            });
        } catch (error) {
            console.error("Error al revocar Refresh Token:", error);
            throw error;
        }
    }
    static async revocarTokenEspecifico(refreshToken) {
        const query = `
        UPDATE refresh_tokens 
        SET revocado = '1' 
        WHERE refresh_token = ?
    `;

        await db.execute({
            sql: query,
            args: [refreshToken]
        });
    };
}

export default TokenModel