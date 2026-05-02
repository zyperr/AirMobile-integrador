import Joi from "joi";


export const schemaProductos = Joi.object({
    nombre_producto: Joi.string().min(3).max(50).required(),

    //.positive() o .min(0) para evitar precios negativos
    precio: Joi.number().positive().required(),

    capacidad: Joi.array().optional(),


    // Una descripción para detallar el modelo, etc.
    descripcion: Joi.string().max(500).optional(),

    // URL de la foto del iPhone. Joi.uri() verifica que sea un link real
    imagen_url: Joi.string().uri().optional(),

    //(Appless, accesorios)
    categoria: Joi.string().min(3).max(30).required(),
    condicion: Joi.string().valid("nuevo", "reacondicionado", "usado").required()
})
