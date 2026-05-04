import Joi from 'joi'; // Asumiendo que usás Joi, si usás Yup es casi idéntico

export const schemaFiltrosProductos = Joi.object({
    // La categoría debe ser texto, opcional, y le quitamos espacios extra
    categoria: Joi.string().trim().min(0).max(50).messages({
        'string.base': 'La categoría debe ser un texto válido.',
        'string.max': 'La categoría no puede tener más de 50 caracteres.'
    }),

    // El precio mínimo debe ser un número mayor o igual a 0
    precioMin: Joi.string().min(0).optional().messages({
        'number.base': 'El precio mínimo debe ser un valor numérico.',
        'number.min': 'El precio mínimo no puede ser negativo.'
    }),

    // El precio máximo debe ser numérico y mayor o igual a 0
    precioMax: Joi.string().min(0).optional().messages({
        'number.base': 'El precio máximo debe ser un valor numérico.',
        'number.min': 'El precio máximo no puede ser negativo.'
    }),

    // La búsqueda debe ser texto, opcional, con un límite lógico
    busqueda: Joi.string().trim().min(0).max(100).messages({
        'string.base': 'El término de búsqueda debe ser un texto.',
        'string.max': 'La búsqueda es demasiado larga (máximo 100 caracteres).'
    }),
    condicion: Joi.string().valid("nuevo", "reacondicionado", "usado","").messages({
        'string.base': 'La categoría debe ser un texto.',
        'any.only': 'La condición no es válida. Solo se permite: {#valids}.'
    })
});