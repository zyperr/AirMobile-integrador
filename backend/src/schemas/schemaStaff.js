import Joi from 'joi';

export const schemaRegistroStaff = Joi.object({
    nombre: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'El nombre no puede estar vacío.',
        'string.min': 'El nombre debe tener al menos 3 caracteres.',
        'string.max': 'El nombre no puede superar los 50 caracteres.',
        'any.required': 'El nombre es obligatorio.'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'El correo electrónico no puede estar vacío.',
        'string.email': 'Debe ingresar un formato de correo electrónico válido.',
        'any.required': 'El correo electrónico es obligatorio.'
    }),
    password: Joi.string().min(8).required().messages({
        'string.empty': 'La contraseña no puede estar vacía.',
        'string.min': 'La contraseña debe tener un mínimo de 8 caracteres para ser segura.',
        'any.required': 'La contraseña es obligatoria.'
    })
});

export const schemaActaulizarStaff = Joi.object({
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Debes ingresar un correo electrónico válido.',
        }),
    nombre: Joi.string().min(3).max(50).optional().messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres.',
        'string.max': 'El nombre no puede superar los 50 caracteres.',
    }),
})


export const filtrosStaffSchema = Joi.object({
    // 'buscar' reemplaza a 'nombre'
    buscar: Joi.string().trim().max(100).optional().allow(''),
    activo: Joi.string().valid('true', 'false', '1', '0').optional()
});