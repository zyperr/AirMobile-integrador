import { Router } from "express";
import { agregarAlCarrito, obtenerCarrito, eliminarProductoDelCarrito , vaciarCarrito, eliminarProductoCompletoDelCarrito} from "../controllers/controllerCarrito.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Rutas para el carrito
//http://localhost:3000/api/carrito/
router.get("/", verificarToken, obtenerCarrito);

router.post("/agregar-carrito/:id", verificarToken, agregarAlCarrito);

router.delete("/eliminar-carrito/:id", verificarToken, eliminarProductoDelCarrito);

router.delete("/vaciar-carrito", verificarToken, vaciarCarrito);

router.delete("/eliminar-producto-completo/:id", verificarToken, eliminarProductoCompletoDelCarrito);

export default router