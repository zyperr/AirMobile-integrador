import {Router} from "express";
import {verificarToken} from "../middlewares/authMiddleware.js";
import { agregarAListaDeseados, obtenerListaDeseados, eliminarDeListaDeseados, ProductosEnDeseados } from "../controllers/controllerListaDeseados.js";

const router = Router();



router.post("/agregar/:id", verificarToken, agregarAListaDeseados);

router.get("/obtener", verificarToken, obtenerListaDeseados);

router.delete("/eliminar/:id", verificarToken, eliminarDeListaDeseados);

router.get("/verificar/:id", verificarToken, ProductosEnDeseados);

export default router