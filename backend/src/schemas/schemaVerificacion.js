import Joi from "joi";
const schemaVerificar = Joi.object({
    codigo: Joi.string().length(6).required() // Exigimos que el código tenga exactamente 6 caracteres
});

export default schemaVerificar