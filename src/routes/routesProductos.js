import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { obtenerProductos,obtenerProducto,crearProducto } from "../controllers/controlerProductos.js";



const router = Router();



router.get("/",obtenerProductos)

router.get("/:id",obtenerProducto)

router.post("/agregar-producto",crearProducto)


export default router