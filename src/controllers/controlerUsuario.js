import UsuarioModel from "../models/modelUsuario.js"
import { comprobarContraseña } from "../middlewares/authMiddleware.js"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { schemaRegistroUsuarios } from '../schemas/schemaRegistroUsuario.js';
import { schemaLoginUsuarios } from '../schemas/schemaLoginUsuarios.js';
import schemaUpdateUsuario from "../schemas/schemaUpdateUsuario.js";


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

        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

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
            id: usuario.id,
            nombre: usuario.nombre,
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

        const { nombre, email, password, rol } = value;


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

export const actualizarUsuario = async (req, res) => {


    const { error, value } = schemaUpdateUsuario.validate(req.body, { abortEarly: false });


    if (error) {
        return res.status(400).json({
            exito: false,
            errores: error.details.map(detalle => detalle.message)
        });
    }


    try {
        
        let {password } = value;

        if (password) {

            const usuarioActual = await UsuarioModel.getById(usuarioId);

            const passwordEsIgual = await comprobarContraseña(password, usuarioActual.password);


            if(passwordEsIgual){
                return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior." });
            }

            password = await bcrypt.hash(password, 10);
        }


        // Si el usuario no mandó email, email será 'undefined' y tu modelo lo ignorará
        // Si no mandó password, password será 'undefined' y tu modelo lo ignorará
       const resultado = await usuarioModel.updateUserPassword(usuarioId, password );

        if (!resultado) {
            return res.status(400).json({ error: "No se enviaron datos válidos para actualizar." });
        }

        res.status(200).json({
            exito: true,
            mensaje: "Tus datos han sido actualizados correctamente."
        });


    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed: usuarios.email')) {
            return res.status(400).json({ error: "Este correo ya está registrado en otra cuenta." });
        }

        console.error("Error en el servidor:", err);
        res.status(500).json({ error: "Error interno al actualizar los datos." });
    }
}
