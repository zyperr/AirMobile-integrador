import Joi from "joi";



const schemaRegistroUsuario = Joi.object({
    nombre: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(6).email({minDomainSegments: 2, tlds:{allow:["com", "net","ar"]}}).required(),
    password: Joi.string().min(6).max(30).required(),
})


export default schemaRegistroUsuario;