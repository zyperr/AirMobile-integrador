import UsuarioModel from "../models/modelUsuario.js"
import { comprobarContraseña } from "../middlewares/authMiddleware.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";



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
        message:"Login exitoso",
        token:token,
        data:datosUsuario
    })
}




export const registro = async (req, res) => {
    try {
        const rol = "cliente"
        const { nombre, email, password } = req.body

        if (!password) {
            return res.status(400).json({
                error: "La contraseña no puede ser nula"
            })
        } 
        if (!email) {
            return res.status(400).json({
                error: "El email no puede ser nulo"
            })
        }
        
        if(!nombre){
            return res.status(400).json({
                error: "El nombre de usuarios no puede ser nulo"
            })
        }

        const usuarioExistente = await UsuarioModel.buscarEmail(email)

        if (usuarioExistente) {
            return res.status(400).json({
                error: "El usuario ya existe"
            })
        }

        //TODO : verificar esto
        const passwordHash = await bcrypt.hash(password, 10)


        const user = await UsuarioModel.createUser({ nombre, email, password:passwordHash, rol });
        
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
