import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { obtenerProductos,obtenerProducto,crearProducto, actualizarProducto, bulkUpload,eliminarProducto } from "../controllers/controllerProductos.js";
import { uploadMiddleware } from "../middlewares/multer.js";



const router = Router();





router.get("/productos",obtenerProductos)

router.get("/:id",obtenerProducto)

router.post("/agregar-producto",verificarToken,crearProducto)
router.put("/actualizar-producto/:id", verificarToken,actualizarProducto)

router.delete("/eliminar-producto/:id", verificarToken,eliminarProducto);
router.post("/carga-masiva",[verificarToken,uploadMiddleware],bulkUpload)


export default router