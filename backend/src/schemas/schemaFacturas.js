import Joi from 'joi';

// Validamos todos los posibles query params de la URL
export const filtrosFacturasSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(10),
    buscar: Joi.string().trim().max(100).optional().allow(''), // Para el nombre
    estado: Joi.string().valid('pagada', 'pendiente', 'cancelada').optional(), // Ajustá los estados a los tuyos
    total: Joi.number().positive().optional(),
    fecha: Joi.date().iso().optional() // Espera un formato YYYY-MM-DD
});