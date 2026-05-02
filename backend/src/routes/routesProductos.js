import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { obtenerProductos,obtenerProducto,crearProducto, actualizarProducto } from "../controllers/controlerProductos.js";



const router = Router();



router.get("/",obtenerProductos)

router.get("/:id",obtenerProducto)

router.post("/agregar-producto",verificarToken,crearProducto)
router.put("/actualizar-producto/:id", verificarToken,actualizarProducto)

export default router