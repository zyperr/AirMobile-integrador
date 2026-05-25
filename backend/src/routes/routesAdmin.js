import { Router } from 'express';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { verificarAdmin } from '../middlewares/verificarAdmin.js';

import { actualizarAdmin, blanquearPasswordStaff, darDeBajaStaff, obtenerStaff, registrarStaff, restaurarStaff } from '../controllers/controllerStaff.js';

const router = Router();

// Endpoint para dar de alta un nuevo administrador (Protegido por ambos middlewares)

// orden de los middlewares -> verificarToken -> verificarAdmin, si o si en este orden
router.get("/", verificarToken, verificarAdmin, obtenerStaff);
router.put("/:id", verificarToken, verificarAdmin, actualizarAdmin);
router.post('/registrar', verificarToken, verificarAdmin, registrarStaff);
router.delete('/baja/:id', verificarToken, verificarAdmin, darDeBajaStaff);
router.put('/restaurar/:id', verificarToken, verificarAdmin, restaurarStaff);
router.put('/reset-password/:id', verificarToken, verificarAdmin, blanquearPasswordStaff);

export default router;