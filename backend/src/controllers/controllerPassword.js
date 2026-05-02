import UsuarioModel from "../models/modelUsuario.js";
import { schemaResetPassword } from "../schemas/schemaResetPassword.js";
import schemaUpdateUsuario from "../schemas/schemaUpdateUsuario.js"
import { enviarEmailConfirmacionPassword, enviarEmailRecuperacion } from "../utils/mailer.js";
import { generarCodigo } from "../middlewares/authMiddleware.js";
import bcrypt from "bcryptjs";

export const actualizarContrasena = async (req, res) => {


    const { error, value } = schemaUpdateUsuario.validate(req.body, { abortEarly: false });


    if (error) {
        return res.status(400).json({
            exito: false,
            errores: error.details.map(detalle => detalle.message)
        });
    }


    try {

        let { password } = value;
        const idUsuario = req.user.id
        const usuarioActual = await UsuarioModel.getbyId(idUsuario);
        
        if (password) {
            const passwordEsIgual = await comprobarContraseña(password, usuarioActual.password);


            if (passwordEsIgual) {
                return res.status(400).json({ error: "La nueva contraseña no puede ser igual a la anterior." });
            }

            password = await bcrypt.hash(password, 10);
        }


        // Si el usuario no mandó email, email será 'undefined' y el modelo lo ignorará
        // Si no mandó password, password será 'undefined' y el modelo lo ignorará

        const resultado = await UsuarioModel.updateUserPassword(idUsuario, password);
        
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



export const resetearPasswordOlvidada = async (req, res) => {
    
    const { error, value } = schemaResetPassword.validate(req.body, { abortEarly: false });


    if (error) {
        return res.status(400).json({
            exito: false,
            errores: error.details.map(detalle => detalle.message)
        });
    }


    try {
        const {email,codigo,nuevaPassword} = value
        // 1. Buscamos al usuario por su email
        const usuario = await UsuarioModel.buscarEmail(email);

        // 2. Verificamos que el código coincida
        if (!usuario || usuario.codigo_verificacion !== codigo) {
            return res.status(400).json({ error: "El código es inválido o ha expirado." });
        }

        
        const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);

        
        await UsuarioModel.updatePasswordAndClearCode(usuario.id,passwordHasheada);


        await enviarEmailConfirmacionPassword(email,usuario.nombre)

        return res.status(200).json({ exito: true, mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno al restablecer la contraseña." });
    }
}


export const solicitarRecuperacion = async (req, res) => {
    const { email } = req.body;

    if(!email){
        return res.status(400).json({exito:false,mensaje: "No se ha proporcionado un email"})
    }
    try {
        const usuario = await UsuarioModel.buscarEmail(email);
        if (!usuario) {
            // Por seguridad, siempre devolvemos OK aunque no exista para no filtrar emails
            return res.status(200).json({ mensaje: "Si el correo existe, te enviaremos un código." });
        }

        // 2. Generamos un código de 6 dígitos aleatorio
        const codigoReseteo = generarCodigo();
        console.log(codigoReseteo)
        // 3. Guardamos este código en la base de datos (en tu columna codigo_verificacion)
        await UsuarioModel.guardarCodigoVerificacion(usuario.id, codigoReseteo);

        
        await enviarEmailRecuperacion(email, codigoReseteo);

        return res.status(200).json({ mensaje: "Si el correo existe, te enviaremos un código." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}