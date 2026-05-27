

import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { obtenerFactura,crearFactura, actualizarEstadoFactura,obtenerDetalleFactura, obtenerTodasLasFacturas, obtenerFacturasDeUsuario } from "../controllers/controllerFactura.js";
import { descargarFacturaPDF } from "../utils/descargarFacturaPDF.js";




const router = Router();

router.post("/crear-factura",verificarToken,crearFactura)

//recibe el id de la factura por params 
router.get("/obtener-factura/:id",verificarToken,obtenerFactura);


//obtiene todas las facturas del sistema admin
router.get("/obtener-facturas",verificarToken,obtenerTodasLasFacturas);

//recibe el id de la factura por params y devuelve el detalle de la factura con los productos comprados, cantidades y precios
router.get("/detalle-factura/:id",verificarToken,obtenerDetalleFactura);
router.get("/detalle-factura/:id/pdf", verificarToken, descargarFacturaPDF);

//router.put("/actualizar-estado/:id",verificarToken,actualizarEstadoFactura);
router.get("/obtener-facturas-usuario",verificarToken,obtenerFacturasDeUsuario);

export default router