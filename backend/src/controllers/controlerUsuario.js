import UsuarioModel from "../models/modelUsuario.js"
import { generarCodigo } from "../middlewares/authMiddleware.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import schemaRegistroUsuarios from '../schemas/schemaRegistroUsuario.js';
import schemaLoginUsuarios from "../schemas/schemaLoginUsuarios.js"
import schemaVerificar from "../schemas/schemaVerificacion.js";
import { enviarCorreoVerificacion } from "../utils/mailer.js";
import jwt from "jsonwebtoken"
import { schemaActualizarNombre } from "../schemas/schemaUpdateUsuario.js";


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

    const { error, value } = schemaLoginUsuarios.validate(req.body, { abortEarly: false })
    if (error) {
        return res.status(400).json({
            exito: false,
            mensaje: "Errores en el formulario:",
            errores: erroresLimpios
        });
    };


    try {
        const { email, password } = value;

        const usuarioEncontrado = await UsuarioModel.buscarEmail(email);
        if (!usuarioEncontrado) {
            return res.status(401).json({ exito: false, message: "Credenciales incorrectas" });
        }

        const passwordCorrecta = await bcrypt.compare(password, usuarioEncontrado.password);

        if (!passwordCorrecta) {
            return res.status(401).json({ exito: false, message: "Credenciales incorrectas" });
        }


        const tokenPayload = {
            id: usuarioEncontrado.id,
            rol: usuarioEncontrado.rol
        };

        const token = jwt.sign(
            tokenPayload,
            SECRET_KEY,
            { expiresIn: '1h' } // La pulsera caduca en 1 hora por seguridad
        )

        const datosUsuario = {
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            rol: usuarioEncontrado.rol
        }

        res.status(200).json({
            message: "Login exitoso",
            token: token,
            data: datosUsuario
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ exito: false, message: "Error interno al iniciar sesión" });
    }


}

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


        res.status(200).json({
            exito: true,
            data: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
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