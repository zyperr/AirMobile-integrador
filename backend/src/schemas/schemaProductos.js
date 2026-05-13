import Joi from "joi";
export const categoriasValidas = [
    // Dispositivos principales
    "celulares",      // iPhones
    "tablets",        // iPads
    "relojes",        // Apple Watches
    "auriculares",    // AirPods, EarPods

    // Carga y energía
    "cargadores",     // Cargadores de pared, bases MagSafe
    "cables",         // Lightning, USB-C a Lightning
    "powerbanks",     // Baterías portátiles, MagSafe Battery Pack

    // Protección y cuidado
    "fundas",         // Fundas de silicona, cuero, transparentes
    "protectores",    // Vidrios templados, hidrogel, protectores de cámara

    // Extras y misceláneos
    "accesorios",     // AirTags, billeteras MagSafe, adaptadores, dongles
]
const categoriasValidasParaBateria = [
    "celulares",      // iPhones
    "tablets",        // iPads
]

export const CAPACIDADES_PERMITIDAS = [
  '16GB', 
  '32GB', 
  '64GB', 
  '128GB', 
  '256GB', 
  '512GB', 
  '1TB', 
  '2TB'
];

export const CONDICIONES_PERMITIDAS = ['nuevo', 'reacondicionado', 'usado'];

export const schemaProductos = Joi.object({
    nombre_producto: Joi.string().min(3).max(50).required(),

    //.positive() o .min(0) para evitar precios negativos
    precio: Joi.number().positive().required(),

    capacidad: Joi.array().items(Joi.string()).valid(...CAPACIDADES_PERMITIDAS).optional(),


    // Una descripción para detallar el modelo, etc.
    descripcion: Joi.string().max(500).optional(),

    // URL de la foto del producto. Joi.uri() verifica que sea un link real
    imagen_url: Joi.array().items(Joi.string().uri()).optional(),

    //(Appless, accesorios)
    categoria: Joi.string().min(3).max(30).valid(...categoriasValidas).required(),

    condicion: Joi.string().valid(...CONDICIONES_PERMITIDAS).required(),

    bateria: Joi.any().when("categoria", {
        is: Joi.string().valid(...categoriasValidasParaBateria),
        then: Joi.number().integer().min(70).max(100).optional(),
        otherwise: Joi.any().strip()
    }),
    
})
