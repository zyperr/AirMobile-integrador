import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { obtenerProductos,obtenerProducto,crearProducto, actualizarProducto, bulkUpload,eliminarProducto } from "../controllers/controllerProductos.js";
import { uploadMiddleware } from "../middlewares/multer.js";
import multer from "multer";


const router = Router();


const upload = multer({storage:multer.memoryStorage()})


router.get("/productos",obtenerProductos)

router.get("/:id",obtenerProducto)

router.post("/agregar-producto",[verificarToken,upload.array('imagen_url',3)],crearProducto)
router.put("/actualizar-producto/:id", verificarToken,actualizarProducto)

router.delete("/eliminar-producto/:id", verificarToken,eliminarProducto);
router.post("/carga-masiva",[verificarToken,uploadMiddleware],bulkUpload)


export default router