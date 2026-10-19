import { Router } from 'express';
import { obtenerProductosBot, chatConIA } from '../controllers/controllerChatBot.js';
 
const router = Router();
 
// GET /api/bot/productos?busqueda=iphone16&categoria=celulares&limit=6&page=1
router.get('/productos', obtenerProductosBot);

// POST /api/bot/chat  { chatInput, sessionId, nombreCliente } → { output }
router.post('/chat', chatConIA);
 
export default router;
 