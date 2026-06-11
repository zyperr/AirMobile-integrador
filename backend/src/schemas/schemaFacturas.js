import Joi from 'joi';
import { ESTADOS } from '../utils/estados.js';

export const filtrosFacturasSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(10),
    buscar: Joi.string().trim().max(100).optional().allow(''), 
    
    estado: Joi.string().valid(...Object.values(ESTADOS)).optional(), 
    
    total: Joi.number().positive().optional(),
    fecha: Joi.date().iso().optional() 
});