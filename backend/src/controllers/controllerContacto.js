import { enviarEmailContacto } from '../utils/mailer.js';
import Joi from 'joi';

const schemaContacto = Joi.object({
    nombre:      Joi.string().min(2).max(100).required(),
    email:       Joi.string().email().required(),
    asunto:      Joi.string().min(3).max(150).required(),
    descripcion: Joi.string().min(10).max(1000).required(),
});

export const enviarFormularioContacto = async (req, res) => {
    const { error, value } = schemaContacto.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            exito: false,
            message: 'Datos inválidos.',
            errores: error.details.map(d => d.message)
        });
    }

    try {
        await enviarEmailContacto(value.nombre, value.email, value.asunto, value.descripcion);
        return res.status(200).json({
            exito: true,
            message: '¡Mensaje enviado! Te responderemos a la brevedad.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            exito: false,
            message: 'Error al enviar el mensaje. Intentá de nuevo.'
        });
    }
};