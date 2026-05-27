import Joi from 'joi'; // Asumiendo que usás Joi, si usás Yup es casi idéntico


import { CAPACIDADES_PERMITIDAS, CONDICIONES_PERMITIDAS } from './schemaProductos.js';

const ordenValidos = ["asc", "desc"]

export const schemaFiltrosProductos = Joi.object({
    // La categoría debe ser texto, opcional, y le quitamos espacios extra
    categoria: Joi.string().trim().min(0).max(50).messages({
        'string.base': 'La categoría debe ser un texto válido.',
        'string.max': 'La categoría no puede tener más de 50 caracteres.'
    }),

    // El precio mínimo debe ser un número mayor o igual a 0
    precioMin: Joi.number().empty('').min(0).optional().messages({
        'number.base': 'El precio mínimo debe ser un valor numérico.',
        'number.min': 'El precio mínimo no puede ser negativo.'
    }),

    // El precio máximo debe ser numérico
    precioMax: Joi.number().empty('').min(0).optional().messages({
        'number.base': 'El precio máximo debe ser un valor numérico.',
        'number.min': 'El precio máximo no puede ser negativo.'
    }),

    // La búsqueda debe ser texto, opcional, con un límite lógico
    busqueda: Joi.string().trim().min(0).max(100).messages({
        'string.base': 'El término de búsqueda debe ser un texto.',
        'string.max': 'La búsqueda es demasiado larga (máximo 100 caracteres).'
    }),
    condicion: Joi.string().valid(...CONDICIONES_PERMITIDAS).messages({
        'string.base': 'La categoría debe ser un texto.',
        'any.only': 'La condición no es válida. Solo se permite: {#valids}.'
    }),

    page: Joi.number().integer().empty('').default(1).min(1).optional().messages({
        'number.base': 'La página debe ser un número.',
        'number.integer': 'La página debe ser un número entero sin decimales.',
        'number.min': 'La página debe ser al menos 1.'
    }),

    orden: Joi.string().valid(...ordenValidos).default(ordenValidos[1]).optional().messages({
        'string.base': 'El orden debe ser un texto.',
        'any.only': 'El orden no es valido. Solo se permite: {#valids}.'
    }),
    bateriaMin: Joi.number().min(70).max(100).multiple(10).optional().messages({
        'number.min': 'La bateria debe de ser 70 o mas',
        'number.max': 'La bateria debe de ser 100 o menos',
    }),

    capacidad: Joi.string().valid(...CAPACIDADES_PERMITIDAS).messages({
        'any.only': 'La capacidad para filtrar no es válida.'
    }).optional(),

    limit: Joi.number().integer().empty('').min(1).max(100).default(10).optional().messages({
        'number.base': 'El límite debe ser un número.',
        'number.integer': 'El límite debe ser un número entero sin decimales.',
        'number.min': 'El límite debe ser al menos 1.',
        'number.max': 'El límite debe ser al menos 100.'
    }),
    offset: Joi.number().integer().empty('').min(0).optional().messages({
        'number.base': 'El desplazamiento debe ser un número.',
        'number.integer': 'El desplazamiento debe ser un número entero sin decimales.',
        'number.min': 'El desplazamiento debe ser al menos 0.'
    }),

});