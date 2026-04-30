import UsuarioModel from "../models/modelUsuario.js"
import { comprobarContraseña, generarCodigo } from "../middlewares/authMiddleware.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import schemaRegistroUsuarios from '../schemas/schemaRegistroUsuario.js';
import schemaLoginUsuarios from "../schemas/schemaLoginUsuarios.js"
import schemaVerificar from "../schemas/schemaVerificacion.js";
import { enviarCorreoVerificacion } from "../utils/mailer.js";
import jwt from "jsonwebtoken"


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

        return res.json(mapUsers)

    } catch (err) {
        res.status(500).json({ error: "Error al obtener los usuarios" })
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
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const passwordCorrecta = await bcrypt.compare(password, usuarioEncontrado.password);

        if (!passwordCorrecta) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
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
        }

        res.status(200).json({
            message: "Login exitoso",
            token: token,
            data: datosUsuario
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno al iniciar sesión" });
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
                error: "El codigo de verificacion no coincide"
            })
        }

        const result = await UsuarioModel.actualizarVerificado(id)

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" })
        }
        return res.status(200).json({ message: "Se ha verificado la cuenta con exito" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Error al verificar el usuario" })
    }

}


export const registro = async (req, res) => {


    const { error, value } = schemaRegistroUsuarios.validate(req.body, { abortEarly: false })

    if (error) {
        // Extraemos solo los mensajes de texto para enviárselos limpios al frontend
        const erroresLimpios = error.details.map(detalle => detalle.message);

        // Retornamos un estado 400 (Bad Request - Petición Incorrecta)
        return res.status(400).json({
            exito: false,
            mensaje: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    }

    try {

        const { nombre, email, password } = value;


        const usuarioExistente = await UsuarioModel.buscarEmail(email)

        if (usuarioExistente) {
            return res.status(400).json({
                error: "El usuario ya existe"
            })
        }


        const passwordHash = await bcrypt.hash(password, 10)

        const codigoVerificacion = generarCodigo();

        const user = await UsuarioModel.createUser({ nombre, email, password: passwordHash, codigo_verificacion: codigoVerificacion });

        const nuevoUser = {
            nombre,
            email,
        };

        enviarCorreoVerificacion(email, codigoVerificacion).catch(console.error);

        res.status(201).json({ data: nuevoUser, message: "Revisa tu correo para verificar la cuenta" })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Error al crear la cuenta" })
    }
}

