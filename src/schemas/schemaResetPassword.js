import Joi from 'joi';

export const schemaResetPassword = Joi.object({
    email: Joi.string().min(6).email({minDomainSegments: 2, tlds:{allow:["com", "net","ar"]}}).required(),
    codigo: Joi.string().length(6).required(),
    nuevaPassword:Joi.string().min(6).max(30).required(),
})

