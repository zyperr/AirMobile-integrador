import { Router } from 'express';
import { obtenerProductosBot } from '../controllers/controllerChatBot.js';
 
const router = Router();
 
// GET /api/bot/productos?busqueda=iphone16&categoria=celulares&limit=6&page=1
router.get('/productos', obtenerProductosBot);
 
export default router;
 