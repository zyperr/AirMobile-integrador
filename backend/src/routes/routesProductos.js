import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { obtenerProductos, obtenerProducto, crearProducto, actualizarProducto, bulkUpload, eliminarProducto } from "../controllers/controllerProductos.js";
import { uploadMiddleware } from "../middlewares/multer.js";
import { uploadImg } from "../middlewares/fileFilter.js";
import { verificarAdmin } from "../middlewares/verificarAdmin.js";

const router = Router();





router.get("/productos", obtenerProductos)

router.get("/:id", obtenerProducto)

router.post("/agregar-producto", verificarToken, verificarAdmin, uploadImg.array('imagen_url', 3), crearProducto);

router.put("/actualizar-producto/:id", verificarToken, verificarAdmin,uploadImg.array('imagen_url', 3), actualizarProducto);

router.delete("/eliminar-producto/:id", verificarToken, verificarAdmin, eliminarProducto);

router.post("/carga-masiva", verificarToken, verificarAdmin, uploadMiddleware, bulkUpload);


export default router