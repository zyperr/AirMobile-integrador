import { Router } from 'express';
import { enviarFormularioContacto } from '../controllers/controllerContacto.js';

const router = Router();

// Pública — no requiere token
router.post('/enviar', enviarFormularioContacto);

export default router;