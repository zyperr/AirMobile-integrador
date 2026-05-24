import ModelStaff from '../models/ModelStaff.js';
import { schemaRegistroStaff, schemaActaulizarStaff } from '../schemas/schemaStaff.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES } from '../utils/roles.js';
import { enviarCorreoBlanqueo } from '../utils/mailer.js';


export const obtenerStaff = async (req, res) => {
    try {
        const staff = await ModelStaff.obtenerStaff();
        const parsedStaff = staff.map((empleado) => {
            return {
                id: empleado.id,
                nombre: empleado.nombre,
                email: empleado.email,
                rol: empleado.rol,
                activo: empleado.activo
            }
        })

        return res.status(200).json({ exito: true, data: parsedStaff });

    } catch (error) {
        console.error("Error al traer el staff:", err);
        return res.status(500).json({
            exito: false,
            message: "Error interno del servidor al intentar traer el staff."
        });
    }
}


export const actualizarAdmin = async (req, res) => {
    const { error, value } = schemaActaulizarStaff.validate(req.body, { abortEarly: false });

    if (error) {
        const erroresLimpios = error.details.map(detalle => detalle.message);
        return res.status(400).json({
            exito: false,
            message: "Por favor, corrige los siguientes errores:",
            errores: erroresLimpios
        });
    };

    try {
        const idAdmin = parseInt(req.params.id);

        const adminActaulizado = await ModelStaff.actualizarDatosBasicos(idAdmin, value);


        return res.status(200).json({ adminActaulizado, exito: true, message: "Datos del admin actualizados correctamente" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ exito: false, message: "Error al actualizar el administrador" })
    }
}

export const restaurarStaff = async (req, res) => {
    try {
        const idRestaurar = parseInt(req.params.id);

        const cuentaRestaurada = await ModelStaff.restaurarStaff(idRestaurar);

        if (cuentaRestaurada) {
            return res.status(200).json({
                exito: true,
                message: "La cuenta del administrador ha sido restaurada y su acceso fue reactivado."
            });
        } else {
            return res.status(404).json({
                exito: false,
                message: "Administrador no encontrado. Es posible que el ID sea incorrecto."
            });
        }
    } catch (error) {
        console.error("Error al restaurar staff:", error);
        return res.status(500).json({
            exito: false,
            message: "Error interno del servidor al intentar restaurar el usuario."
        });
    }
};
export const registrarStaff = async (req, res) => {
    // 1. Validación con Joi
    const { error, value } = schemaRegistroStaff.validate(req.body, { abortEarly: false });

    if (error) {
        const erroresLimpios = error.details.map(err => err.message);
        return res.status(400).json({
            exito: false,
            message: "Errores en el formulario de registro.",
            errores: erroresLimpios
        });
    }

    try {
        const { nombre, email, password } = value;

        // 2. Usar el modelo para verificar si el correo ya existe
        const emailExiste = await ModelStaff.verificarEmailExistente(email);

        if (emailExiste) {
            return res.status(409).json({
                exito: false,
                message: "El correo ingresado ya pertenece a un usuario registrado."
            });
        }

        // 3. Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // 4. Usar el modelo para insertar el nuevo empleado
        const staffCreado = await ModelStaff.crearStaff(nombre, email, passwordEncriptada);

        if (staffCreado) {
            // 5. Devolver respuesta de éxito al frontend
            return res.status(201).json({
                exito: true,
                message: "¡Nuevo administrador creado con éxito! Ya puede iniciar sesión en el panel ABM."
            });
        } else {
            // Falla de seguridad o error inesperado en Turso sin lanzar excepción
            throw new Error("No se pudo insertar el registro en la base de datos.");
        }

    } catch (err) {
        console.error("Error al registrar staff:", err);
        return res.status(500).json({
            exito: false,
            message: "Error interno del servidor al intentar crear el usuario staff."
        });
    }
};


export const darDeBajaStaff = async (req, res) => {
    try {
        const idEliminar = parseInt(req.params.id);

        // 1. Regla de negocio: Prevención de auto-bloqueo
        if (req.user.id === idEliminar) {
            return res.status(403).json({
                exito: false,
                message: "Acción denegada. No puedes desactivar tu propia cuenta de administrador."
            });
        }

        // 2. Ejecutar la acción de Soft Delete en el modelo
        const staffDesactivado = await ModelStaff.darBajaStaff(idEliminar);

        // 3. Manejar la respuesta
        if (staffDesactivado) {
            return res.status(200).json({
                exito: true,
                message: "La cuenta del administrador ha sido desactivada exitosamente. Se ha revocado su acceso."
            });
        } else {
            return res.status(404).json({
                exito: false,
                message: "Administrador no encontrado o la cuenta ya se encuentra inactiva."
            });
        }

    } catch (err) {
        console.error("Error al desactivar staff:", err);
        return res.status(500).json({
            exito: false,
            message: "Error interno del servidor al intentar modificar el estado del usuario."
        });
    }
};


export const blanquearPasswordStaff = async (req, res) => {
    try {
        const idEmpleado = parseInt(req.params.id);

        // 1. Obtener los datos del empleado para enviarle el correo
        const datosEmpleado = await ModelStaff.obtenerDatosBasicosPorId(idEmpleado);
        
        if (!datosEmpleado) {
            return res.status(404).json({ 
                exito: false, 
                message: "Administrador no encontrado." 
            });
        }

        // 2. Generar contraseña temporal segura (Ej: a8f7b2c9A1!)
        // Le concatenamos 'A1!' para asegurarnos de que pase cualquier validación futura de Joi
        const passwordTemporal = crypto.randomBytes(4).toString('hex') + 'A1!';

        // 3. Encriptar la contraseña temporal
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(passwordTemporal, salt);

        // 4. Guardar en la base de datos
        const passwordActualizada = await ModelStaff.actualizarPassword(idEmpleado, passwordEncriptada);

        if (!passwordActualizada) {
            return res.status(400).json({ 
                exito: false, 
                message: "No se pudo actualizar la contraseña. Verifique que el usuario esté activo." 
            });
        }

        // Por si usamos n8n par la automatizacion cuando este listo
        /*
        await fetch('https://tu-url-de-n8n.com/webhook/blanqueo-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: datosEmpleado.email,
                nombre: datosEmpleado.nombre,
                nuevaPassword: passwordTemporal
            })
        });
        */

        // Nodemailer por el momento
        await enviarCorreoBlanqueo(datosEmpleado.email, datosEmpleado.nombre, passwordTemporal);        

        return res.status(200).json({
            exito: true,
            message: `Contraseña blanqueada exitosamente. Se ha enviado un correo a ${datosEmpleado.email} con las nuevas credenciales.`
        });

    } catch (error) {
        console.error("Error en blanqueo de emergencia:", error);
        return res.status(500).json({ 
            exito: false, 
            message: "Error interno del servidor al intentar blanquear la contraseña." 
        });
    }
};