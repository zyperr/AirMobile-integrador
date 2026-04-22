import Joi from 'joi';

export const schemaLoginUsuario = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'El correo no puede estar vacío.',
            'string.email': 'Debes ingresar un correo electrónico válido.',
            'any.required': 'El correo es obligatorio.'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'La contraseña no puede estar vacía.',
            'any.required': 'La contraseña es obligatoria.'
        })
});
export default schemaLoginUsuario;