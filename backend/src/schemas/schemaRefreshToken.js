import Joi from "joi";

// 1. Schema para blindar la inserción en la base de datos (Modelo)
export const insertarTokenSchema = Joi.object({
    idUsuario: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID de usuario debe ser un número.',
        'number.positive': 'El ID de usuario debe ser un número positivo.',
        'any.required': 'El ID de usuario es obligatorio.'
    }),
    refreshToken: Joi.string().min(20).required().messages({
        'string.empty': 'El refresh token no puede estar vacío.',
        'string.min': 'El refresh token no cumple con la longitud mínima de seguridad.',
        'any.required': 'El refresh token es obligatorio.'
    }),
    fechaExpiracionStr: Joi.string().isoDate().required().messages({
        'string.isoDate': 'La fecha de expiración debe tener un formato ISO 8601 válido.',
        'any.required': 'La fecha de expiración es obligatoria.'
    })
});

// 2. Schema para blindar la petición HTTP del cliente (Ruta POST /refresh)
export const renovarTokenRequestSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'No se proporcionó ningún token para renovar la sesión.',
        'any.required': 'El token de renovación es obligatorio en el cuerpo de la petición.'
    })
});
