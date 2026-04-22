const { allow } = require("joi");

const Joi = requieres("joi");



const schemaRegistroUsuario = Joi.object({
    nombre: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(6).email({minDomainSegments: 2, tlds:{allow:["com", "net","ar"]}}).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required(),
    rol: Joi.string().valid('admin', 'cliente').default('cliente'),
})


export default schemaRegistroUsuario;