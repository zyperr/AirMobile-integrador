import {Router} from "express";
import {verificarToken} from "../middlewares/authMiddleware.js";
import { agregarAListaDeseados, obtenerListaDeseados, eliminarDeListaDeseados } from "../controllers/controllerListaDeseados.js";

const router = Router();



router.post("/agregar/:id", verificarToken, agregarAListaDeseados);

router.get("/obtener", verificarToken, obtenerListaDeseados);

router.delete("/eliminar/:id", verificarToken, eliminarDeListaDeseados);

export default router