import Joi from 'joi';

export const schemaUpdateUsuario = Joi.object({
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Debes ingresar un correo electrónico válido.'
        }),
        
    password: Joi.string()
        .min(6)
        .max(30)
        .optional()
        .messages({
            'string.min': 'La nueva contraseña debe tener al menos 6 caracteres.'
        })
})
.min(1)
.messages({
    'object.min': 'Debes proporcionar al menos un email o una contraseña para actualizar.'
});

export default schemaUpdateUsuario;