import Joi from 'joi';

export const schemaActualizarProducto = Joi.object({
    
    nombre_producto: Joi.string().min(3).max(50).optional(),
    
    precio: Joi.number().positive().optional(), 
    
    stock: Joi.number().integer().min(0).optional(),
    

    capacidad: Joi.array().items(Joi.string()).optional(), 
    
    descripcion: Joi.string().max(500).optional(),
    
    imagen_url: Joi.string().uri().optional(),
    
    categoria: Joi.string().min(3).max(30).optional(),

    condicion: Joi.string().valid("nuevo", "reacondicionado", "usado").optional()

}).min(1);

