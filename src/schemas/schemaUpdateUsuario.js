
import {Joi} from "joi";


const schemaUpdateUsuario = Joi.object({
    email: Joi.string().email().optional().message({
        'string.email': 'Por favor, ingresa un correo electrónico válido.',
    }),
    password: Joi.string().min(6).optional().messages({
        'string.min': 'La nueva contraseña debe tener al menos 6 caracteres.'
    })
}).min(1).message({
    'object.min': 'Debes proporcionar al menos un campo para actualizar.'
});

export default schemaUpdateUsuario;