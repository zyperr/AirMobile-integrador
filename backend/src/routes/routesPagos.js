import { Router } from "express";
import { crearPreferencia, recibirWebhook } from "../controllers/controllerPago.js";
import { verificarToken } from "../middlewares/authMiddleware.js";



const router = Router();


router.post('/crear-preferencia', verificarToken, crearPreferencia);

// ==========================================
// 2. RUTA DEL WEBHOOK 
// ==========================================
// Mercado Pago llama a esta ruta automáticamente por detrás para avisar del pago
router.post('/webhook', recibirWebhook);
export default router