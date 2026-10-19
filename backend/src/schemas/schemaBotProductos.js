import Joi from 'joi';

// Categorías válidas — coinciden exactamente con los valores guardados en la DB
// y con las instrucciones del system prompt del bot en n8n
const CATEGORIAS_BOT = [
    'celulares',
    'tablets',
    'relojes',
    'auriculares',
    'cargadores',
    'cables',
    'powerbanks',
    'fundas',
    'protectores',
    'accesorios'
];

export const schemaBotFiltros = Joi.object({
    busqueda: Joi.string().trim().max(100).allow('').optional().messages({
        'string.max': 'La búsqueda es demasiado larga (máximo 100 caracteres).'
    }),

    categoria: Joi.string().valid(...CATEGORIAS_BOT).allow('').optional().messages({
        'any.only': `Categoría no válida. Las opciones son: ${CATEGORIAS_BOT.join(', ')}.`
    }),

    limit: Joi.number().integer().min(1).max(20).default(6).optional().messages({
        'number.base': 'El límite debe ser un número.',
        'number.max': 'El límite no puede superar 20 resultados.'
    }),

    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'La página debe ser un número.',
        'number.min': 'La página debe ser al menos 1.'
    })
});