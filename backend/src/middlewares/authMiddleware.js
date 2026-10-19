import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

// Podemos leer la llave directamente cuando la necesitamos, 
// o dejarla aquí arriba, pero no en ambos lados.
const SECRET_KEY = process.env.SECRET_KEY;

export const verificarToken = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];
    

    // 1. Validamos que exista Y que tenga el formato correcto "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado o formato inválido." });
    }

    // 2. Extraemos el token con seguridad
    const token = authHeader.split(' ')[1];

    // 3. Usamos try/catch en lugar del callback para un código más moderno y asíncrono
    try {
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user; // Guardamos el payload (id, email) en la request
        next();
    } catch (error) {
        console.log("ERROR JWT:", error);
        // Si el token expiró o fue manipulado, cae directamente aquí
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
}

export const comprobarContrasena = async (password, userPassword) => {
    // Compara de forma asíncrona la contraseña plana con el hash guardado de la base de datos
    return await bcrypt.compare(password, userPassword);
}

export const generarCodigo = () => {
    // Excelente uso de crypto para evitar la predecibilidad de Math.random()
    return crypto.randomInt(100000, 999999).toString();
}