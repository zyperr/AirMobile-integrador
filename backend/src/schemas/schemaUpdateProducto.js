import Joi from 'joi';
import { CAPACIDADES_PERMITIDAS, CONDICIONES_PERMITIDAS } from './schemaProductos.js';

export const schemaActualizarProducto = Joi.object({
    
    nombre_producto: Joi.string().min(3).max(50).optional(),
    
    precio: Joi.number().positive().optional(), 

    capacidad: Joi.alternatives().try(
        Joi.array().items(Joi.string().valid(...CAPACIDADES_PERMITIDAS)),
        Joi.string().valid(...CAPACIDADES_PERMITIDAS)
    ).optional(),
    
    descripcion: Joi.string().max(500).optional(),
    
    imagen_url: Joi.array().items(Joi.string().uri()).optional(),
    
    categoria: Joi.string().min(3).max(30).optional(),

    condicion: Joi.string().valid(...CONDICIONES_PERMITIDAS).optional(),
    
    bateria: Joi.any().when("categoria", {
        is: Joi.string().valid("iphone","iphones","smartphones","ipad","tablets"),
        then: Joi.number().integer().min(1).max(100).optional(),
        otherwise: Joi.any().strip()
    }),
    layout_imagenes: Joi.string().optional(),
}).min(1);

