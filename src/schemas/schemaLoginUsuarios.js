const Joi = require("joi");


const schemaLoginUsuario = Joi.object({
    email: Joi.string().email().required().message({
        'string.empty': 'El correo electrónico no puede estar vacío.',
        'string.email': 'Por favor, ingresa un correo electrónico válido.',
        'any.required': 'El correo electrónico es obligatorio.'
    }),

    password: Joi.string().required().message({
        'string.empty': 'La contraseña no puede estar vacía.', 
    })
})