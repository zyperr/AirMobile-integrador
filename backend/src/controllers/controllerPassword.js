import UsuarioModel from "../models/modelUsuario.js";
import { schemaResetPassword } from "../schemas/schemaResetPassword.js";
import {schemaActualizarPassword} from "../schemas/schemaUpdateUsuario.js"
import { enviarEmailConfirmacionPassword, enviarEmailRecuperacion } from "../utils/mailer.js";
import { generarCodigo, comprobarContrasena } from "../middlewares/authMiddleware.js";
import bcrypt from "bcryptjs";

export const actualizarContrasena = async (req, res) => {

    // 1. Validación de Joi
    const { error, value } = schemaActualizarPassword.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            exito: false,
            message: "Por favor, revisa los datos enviados.",
            errores: error.details.map(detalle => detalle.message)
        });
    }

    try {
        let { password } = value; // Este es el newPassword que viene del frontend
        const idUsuario = req.user.id;
        
        // 2. Buscamos al usuario y validamos que exista
        const usuarioActual = await UsuarioModel.getbyId(idUsuario);

        if (!usuarioActual) {
            return res.status(404).json({ 
                exito: false, 
                message: "No se encontró el usuario en la base de datos." 
            });
        }

        // Verificamos que la nueva no sea igual a la vieja
        if (password) {
            
            const passwordEsIgual = await comprobarContrasena(password, usuarioActual.password);

            if (passwordEsIgual) {
                return res.status(400).json({ 
                    exito: false, 
                    message: "La nueva contraseña no puede ser igual a la anterior." 
                });
            }

            // Encriptamos la nueva contraseña
            password = await bcrypt.hash(password, 10);
        }

        // Actualizamos en la base de datos
        const resultado = await UsuarioModel.updateUserPassword(idUsuario, password);

        if (!resultado) {
            return res.status(400).json({ 
                exito: false, 
                message: "No se pudo actualizar la contraseña." 
            });
        }

        
        res.status(200).json({
            exito: true,
            message: "Tu contraseña ha sido actualizada correctamente."
        });

    } catch (err) {
        
        console.error("Error en el servidor (actualizarContrasena):", err);
        res.status(500).json({ 
            exito: false, 
            message: "Error interno al actualizar la contraseña." 
        });
    }
}



export const resetearPasswordOlvidada = async (req, res) => {

    const { error, value } = schemaResetPassword.validate(req.body, { abortEarly: false });


    if (error) {
        return res.status(400).json({
            exito: false,
            errores: error.details.map(detalle => detalle.message)
        });
    }


    try {
        const { email, codigo, nuevaPassword } = value
        // 1. Buscamos al usuario por su email
        const usuario = await UsuarioModel.buscarEmail(email);

        // 2. Verificamos que el código coincida
        if (!usuario || usuario.codigo_verificacion !== codigo) {
            return res.status(400).json({ message: "El código es inválido o ha expirado." });
        }

        const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);


        await UsuarioModel.updatePasswordClearCodeVerificate(email, passwordHasheada, codigo);


        await enviarEmailConfirmacionPassword(email, usuario.nombre)

        return res.status(200).json({ exito: true, mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error interno al restablecer la contraseña." });
    }
}


export const solicitarRecuperacion = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ exito: false, message: "No se ha proporcionado un email" })
    }
    try {
        const usuario = await UsuarioModel.buscarEmail(email);
        if (!usuario) {
            // Por seguridad, siempre devolvemos OK aunque no exista para no filtrar emails
            return res.status(200).json({ message: "Si el correo existe, te enviaremos un código." });
        }

        // 2. Generamos un código de 6 dígitos aleatorio
        const codigoReseteo = generarCodigo();
        // 3. Guardamos este código en la base de datos (en tu columna codigo_verificacion)
        await UsuarioModel.guardarCodigoVerificacion(usuario.id, codigoReseteo);


        await enviarEmailRecuperacion(email, codigoReseteo);

        return res.status(200).json({ message: "Si el correo existe, te enviaremos un código." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
}