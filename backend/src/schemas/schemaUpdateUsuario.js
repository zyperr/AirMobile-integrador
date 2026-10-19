import Joi from 'joi';

export const schemaUpdateUsuario = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Debes ingresar un correo electrónico válido.'
        }),
        
    password: Joi.string()
        .min(6)
        .max(30)
        .optional()
        .messages({
            'string.min': 'La nueva contraseña debe tener al menos 6 caracteres.'
        }),

})
.min(1)
.messages({
    'object.min': 'Debes proporcionar al menos un email o una contraseña para actualizar.'
});

export const schemaActualizarPassword = Joi.object({
    password: Joi.string()
        .min(8) // Sincronizado con los 8 caracteres de tu frontend
        .max(30)
        .required() // Ahora sí, la contraseña es la única obligatoria
        .messages({
            'string.empty': 'La contraseña no puede estar vacía.',
            'string.min': 'La nueva contraseña debe tener al menos {#limit} caracteres.',
            'string.max': 'La nueva contraseña no puede superar los {#limit} caracteres.',
            'any.required': 'La nueva contraseña es obligatoria.'
        })
});

export const schemaActualizarNombre = Joi.object({
    nombre: Joi.string().trim().min(2).max(50).required().messages({
        'string.base': 'El nombre debe ser un texto.',
        'string.empty': 'El nombre no puede estar vacío.',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres.',
        'string.max': 'El nombre no puede superar los {#limit} caracteres.',
        'any.required': 'El campo nombre es obligatorio.'
    })
});

export const schemaActualizarCorreo = Joi.object({
    email: Joi.string().email().required().messages({
        'string.base': 'El correo debe ser un texto.',
        'string.empty': 'El correo no puede estar vacío.',
        'string.email': 'Debes ingresar un correo electrónico válido.',
        'any.required': 'El campo correo es obligatorio.'
    })
});
export default schemaUpdateUsuario;