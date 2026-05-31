import UsuarioModel from "../models/modelUsuario.js"
import { generarCodigo } from "../middlewares/authMiddleware.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from 'crypto';
import schemaRegistroUsuarios from '../schemas/schemaRegistroUsuario.js';
import schemaLoginUsuarios from "../schemas/schemaLoginUsuarios.js"
import schemaVerificar from "../schemas/schemaVerificacion.js";
import { enviarCorreoVerificacion } from "../utils/mailer.js";
import jwt from "jsonwebtoken"
import { schemaActualizarNombre } from "../schemas/schemaUpdateUsuario.js";
import TokenModel from "../models/modelToken.js";
import { insertarTokenSchema, renovarTokenRequestSchema } from "../schemas/schemaRefreshToken.js";

dotenv.config();


const SECRET_KEY = process.env.SECRET_KEY

export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await UsuarioModel.getAll()
        console.log("Mostrando usuarios")
        const mapUsers = usuarios.map((usuario) => {
            return {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        })

        return res.json({ mapUsers, exito: true, message: "Lista de los usuarios" })

    } catch (err) {
        res.status(500).json({ exito: false, message: "Error al obtener los usuarios" })
    }
}



export const login = async (req, res) => {
    // 1. Validación inicial de credenciales
    const { error, value } = schemaLoginUsuarios.validate(req.body, { abortEarly: false });
    if (error) {
        // Corrección: Mapeamos los errores para que erroresLimpios exista
        const erroresLimpios = error.details.map(err => err.message);
        return res.status(400).json({
            exito: false,
            mensaje: "Errores en el formulario:",
            errores: erroresLimpios
        });
    }

    try {
        const { email, password } = value;

        // 2. Búsqueda y verificación
        const usuarioEncontrado = await UsuarioModel.buscarEmail(email);
        if (!usuarioEncontrado) {
            return res.status(401).json({ exito: false, message: "Credenciales incorrectas" });
        }

        const passwordCorrecta = await bcrypt.compare(password, usuarioEncontrado.password);
        if (!passwordCorrecta) {
            return res.status(401).json({ exito: false, message: "Credenciales incorrectas" });
        }

        console.log("ID del usuario que intentamos guardar:", usuarioEncontrado.id);
        // --- INICIO LÓGICA REFRESH TOKEN ---
        // Generamos un string hexadecimal de 80 caracteres
        const refreshToken = crypto.randomBytes(40).toString('hex');

        // Calculamos la vigencia (ej. 7 días)
        const diasVigencia = 7;
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + diasVigencia);
        const fechaExpiracionStr = fechaExpiracion.toISOString();

        // Blindamos los datos con Joi antes de tocar la base de datos
        const { error: errorToken, value: valueToken } = insertarTokenSchema.validate({
            idUsuario: usuarioEncontrado.id,
            refreshToken,
            fechaExpiracionStr
        });

        if (errorToken) {
            console.error("Error al validar schema de Refresh Token:", errorToken.details[0].message);
            return res.status(500).json({ exito: false, message: "Error interno al generar la sesión segura." });
        }

        // Delegamos la inserción a la capa de datos (Turso)
        await TokenModel.guardarRefreshToken(valueToken.refreshToken,valueToken.idUsuario, valueToken.fechaExpiracionStr);
        // --- FIN LÓGICA REFRESH TOKEN ---

        // --- LÓGICA ACCESS TOKEN ---
        const tokenPayload = {
            id: usuarioEncontrado.id,
            rol: usuarioEncontrado.rol,
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre
        };

        const token = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: '15m' } // Bajamos de '1h' a '15m' por seguridad
        );

        const datosUsuario = {
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            rol: usuarioEncontrado.rol,
            email: usuarioEncontrado.email
        };

        // 3. Respuesta al cliente
        res.status(200).json({
            exito: true,
            message: "Login exitoso",
            token: token,               // Llave de uso diario (15 min)
            refreshToken: refreshToken, // Llave maestra (7 días)
            data: datosUsuario
        });

    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ exito: false, message: "Error interno al iniciar sesión" });
    }
};

export const verificar = async (req, res) => {
    const { error, value } = schemaVerificar.validate(req.body, { abortEarly: false })

    if (error) {

        const erroresLimpios = error.details.map(detalle => detalle.message);

        return res.status(400).json({
            exito: false,
            mensaje: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    }

    try {
        const id = req.user.id

        const { codigo } = value

        const usuario = await UsuarioModel.getbyId(id)

        if (codigo !== usuario.codigo_verificacion) {
            return res.status(400).json({
                exito: false,
                message: "El codigo de verificacion no coincide"
            })
        }

        const result = await UsuarioModel.actualizarVerificado(id)

        if (result.rowsAffected === 0) {
            return res.status(404).json({ exito: false, message: "Usuario no encontrado" })
        }
        return res.status(200).json({ exito: false, message: "Se ha verificado la cuenta con exito" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ exito: false, message: "Error al verificar el usuario" })
    }

}


export const registro = async (req, res) => {

    const { error, value } = schemaRegistroUsuarios.validate(req.body, { abortEarly: false })

    if (error) {
        const erroresLimpios = error.details.map(detalle => detalle.message);

        return res.status(400).json({
            exito: false,
            message: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    }

    try {
        const { nombre, email, password } = value;

        const usuarioExistente = await UsuarioModel.buscarEmail(email)

        if (usuarioExistente) {
            return res.status(400).json({
                exito: false, // Aquí está perfecto
                message: "El usuario ya existe"
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const codigoVerificacion = generarCodigo();

        const user = await UsuarioModel.createUser({
            nombre,
            email,
            password: passwordHash,
            codigo_verificacion: codigoVerificacion
        });

        const nuevoUser = { nombre, email };

        // Envío asíncrono para no bloquear la respuesta
        enviarCorreoVerificacion(email, codigoVerificacion).catch(console.error);

        // ¡CORRECCIÓN: exito pasa a true!
        res.status(201).json({
            exito: true,
            data: nuevoUser,
            message: "Revisa tu correo para verificar la cuenta"
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ exito: false, message: "Error al crear la cuenta" })
    }
}


export const obtenerPerfil = async (req, res) => {
    try {


        const id = req.user.id;


        const usuario = await UsuarioModel.getbyId(id);


        if (!usuario) {
            return res.status(404).json({ exito: false, message: "Usuario no encontrado" });
        }

        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        }

        res.status(200).json({
            exito: true,
            data: payload,
            message: "Perfil del usuario"
        });

    } catch (err) {
        console.log("Error capturado en el catch:", err);
        res.status(500).json({ exito: false, message: "Error al obtener el perfil del usuario" });
    }
}



export const actualizarNombreUsuario = async (req, res) => {

    const { error, value } = schemaActualizarNombre.validate(req.body, { abortEarly: false });

    if (error) {
        const erroresLimpios = error.details.map(detalle => detalle.message);

        return res.status(400).json({
            exito: false,
            message: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    }
    try {


        // 1. Extraemos el ID del token (gracias a tu middleware verificarToken)
        const idUsuario = req.user.id;

        // 2. Extraemos el nuevo nombre del body que enviará React
        const { nombre } = value;

        // 3. Validación básica de seguridad
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({
                exito: false,
                message: "El nombre no puede estar vacío"
            });
        }

        // 4. Ejecutamos la actualización en la BD
        const actualizado = await UsuarioModel.actualizarNombre(idUsuario, nombre.trim());

        if (!actualizado) {
            return res.status(404).json({
                exito: false,
                message: "No se encontró el usuario para actualizar"
            });
        }

        // 5. Respuesta exitosa
        return res.status(200).json({
            exito: true,
            message: "Nombre actualizado correctamente",
            data: { nombre } // Devolvemos el nombre limpio por si el frontend lo necesita
        });

    } catch (err) {
        console.error("Error en actualizarNombreUsuario:", err);
        return res.status(500).json({
            exito: false,
            message: "Error interno al actualizar el perfil"
        });
    }
}

export const renovarSesion = async (req, res) => {
    // 1. Validar cuerpo de la petición
    const { error, value } = renovarTokenRequestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ exito: false, message: error.details[0].message });
    }

    const tokenEntrante = value.refreshToken;

    try {
        // 2. Buscar en la base de datos
        const tokenDB = await TokenModel.buscarRefreshToken(tokenEntrante);

        // Guard Clause 1: El token no existe
        if (!tokenDB) {
            return res.status(401).json({ exito: false, message: "Sesión inválida." });
        }

        // Guard Clause 2: El token fue revocado previamente (posible robo)
        if (tokenDB.revocado === 1) {
            return res.status(401).json({ exito: false, message: "Sesión revocada. Vuelva a iniciar sesión." });
        }

        // Guard Clause 3: El token caducó por tiempo (ej. pasaron más de 7 días)
        const ahora = new Date();
        const expiracion = new Date(tokenDB.fecha_expiracion);
        if (expiracion < ahora) {
            return res.status(401).json({ exito: false, message: "Sesión expirada. Vuelva a iniciar sesión." });
        }

        // 3. Buscar datos del usuario para el nuevo JWT
        const usuarioEncontrado = await UsuarioModel.getbyId(tokenDB.usuario_id);
        if (!usuarioEncontrado) {
            return res.status(401).json({ exito: false, message: "Usuario no encontrado." });
        }

        // 4. Generar NUEVO Access Token (15 min)
        const tokenPayload = {
            id: usuarioEncontrado.id,
            rol: usuarioEncontrado.rol,
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre
        };

        const nuevoAccessToken = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '15m' });

        // 5. ROTACIÓN: Revocar el viejo y crear uno nuevo
        await TokenModel.revocarRefreshToken(tokenEntrante);

        const nuevoRefreshToken = crypto.randomBytes(40).toString('hex');
        const nuevaFechaExpiracion = new Date();
        nuevaFechaExpiracion.setDate(nuevaFechaExpiracion.getDate() + 7);

        await TokenModel.guardarRefreshToken(nuevoRefreshToken,usuarioEncontrado.id, nuevaFechaExpiracion.toISOString());

        // 6. Enviar nuevas credenciales al cliente
        res.status(200).json({
            exito: true,
            message: "Sesión renovada con éxito",
            token: nuevoAccessToken,
            refreshToken: nuevoRefreshToken
        });

    } catch (err) {
        console.error("Error al renovar la sesión:", err);
        res.status(500).json({ exito: false, message: "Error interno del servidor." });
    }
};


export const cerrarSesion = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "No se proporcionó un token para revocar" });
        }

        // Llamamos al modelo para aplicar el Soft Delete (revocado = 1)
        await TokenModel.revocarTokenEspecifico(refreshToken);

        return res.status(200).json({ 
            exito: true, 
            message: "Sesión cerrada y token revocado correctamente" 
        });

    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return res.status(500).json({ error: "Error interno del servidor al cerrar sesión" });
    }
};