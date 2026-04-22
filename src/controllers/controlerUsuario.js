import UsuarioModel from "../models/modelUsuario.js"
import { comprobarContraseña } from "../middlewares/authMiddleware.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { schemaRegistroUsuarios } from '../schemas/schemaRegistroUsuario.js';


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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "El email y la contraseña son obligatorios" })
    }

    const usuario = await UsuarioModel.buscarEmail(email)

    if (!usuario) {
        return res.status(401).json({ error: "Credenciales inválidas" });
    }


    if (!comprobarContraseña(password, usuario.password)) {
        return res.status(401).json({ error: "Credenciales inválidas" });
    }


    const token = jwt.sign(
        { id: usuarioEncontrado.id, email: usuarioEncontrado.email },
        SECRET_KEY,
        { expiresIn: '1h' } // La pulsera caduca en 1 hora por seguridad
    )

    const datosUsuario = {
        id: usuario.id,
        nombre: usuario.nombre,
    }

    res.status(200).json({
        message: "Login exitoso",
        token: token,
        data: datosUsuario
    })
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
        
        const { nombre, email, password ,rol} = value;


        const usuarioExistente = await UsuarioModel.buscarEmail(email)

        if (usuarioExistente) {
            return res.status(400).json({
                error: "El usuario ya existe"
            })
        }

        
        const passwordHash = await bcrypt.hash(password, 10)


        const user = await UsuarioModel.createUser({ nombre, email, password: passwordHash, rol });

        const nuevoUser = {
            nombre,
            email,
            rol
        };


        res.status(201).json({ data: nuevoUser, message: "La cuenta ha sido creado con exito" })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Error al crear la cuenta" })
    }
}
