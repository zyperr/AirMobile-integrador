import 'dotenv/config';
import UsuarioModel from "../models/modelUsuario.js";
import ModelCarrito from "../models/modelCarrito.js";
import ModelFactura from "../models/modelFactura.js";
import ModelDetalleFactura from "../models/modelDetalleFactura.js";
import ModelProductos from "../models/modelProductos.js";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { enviarEmailCompra } from '../utils/mailer.js';
import { ESTADOS } from '../utils/estados.js';

console.log("Token cargado:", process.env.MP_ACCESS_TOKEN ? "SÍ" : "NO");

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-TU_TOKEN_DE_PRUEBA'
});

const mapearEstadoMP = (estadoMP) => {
    const mapa = {
        'approved':   ESTADOS.COMPLETADO,
        'pending':    ESTADOS.PENDIENTE,
        'in_process': ESTADOS.PENDIENTE,
        'rejected':   ESTADOS.CANCELADO,
        'cancelled':  ESTADOS.CANCELADO,
        'refunded':   ESTADOS.REEMBOLSADO,
    };
    return mapa[estadoMP] || ESTADOS.PENDIENTE;
};

export const crearPreferencia = async (req, res) => {
    try {
        const userId = req.user.id;

        const usuario = await UsuarioModel.getbyId(userId);
        if (!usuario) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const carritoItems = await ModelCarrito.getCarrito(userId);

        if (!carritoItems || carritoItems.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        const itemsMercadoPago = [];

        for (const item of carritoItems) {
            const productoCompleto = await ModelProductos.getById(item.producto_id);
            
            let listaCapacidades = [];
            if (productoCompleto && productoCompleto.capacidad) {
                try {
                    listaCapacidades = typeof productoCompleto.capacidad === 'string'
                        ? JSON.parse(productoCompleto.capacidad)
                        : productoCompleto.capacidad;
                } catch (e) {
                    listaCapacidades = [];
                }
            }

            // BLINDAJE: Limpiamos espacios y evitamos errores si viene undefined
            const capUsuario = item.capacidad ? String(item.capacidad).trim() : "";
            const index = listaCapacidades.findIndex(cap => String(cap).trim() === capUsuario);
            
            let extra = 0;
            if (index === 1) extra = 100;
            if (index === 2) extra = 250;
            if (index === 3) extra = 400;

            const precioBase = Number(item.precio_unitario || item.precio || 0);
            const precioFinal = precioBase + extra;

            // Agregamos un log para que veas en consola si lo calculó bien
            console.log(`Calculando: ${item.nombre_producto} | Capacidad: ${capUsuario} | Extra: $${extra} | Total: $${precioFinal}`);

            itemsMercadoPago.push({
                title: item.capacidad ? `${item.nombre_producto} (${item.capacidad})` : item.nombre_producto,
                unit_price: precioFinal, 
                quantity: Number(item.cantidad),
                currency_id: "ARS",
            });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: itemsMercadoPago,
                external_reference: userId.toString(),
                notification_url: "https://estrogen-spry-brunette.ngrok-free.dev/api/pagos/webhook",
                back_urls: {
                    success: "localhost:5173/pago-exitoso",
                    failure: "localhost:5173/pago-fallido",
                    pending: "localhost:5173/pago-pendiente"
                },
                auto_return: "all"
            }
        });

        return res.json({ exito: true, init_point: result.init_point });

    } catch (error) {
        console.error("Error completo:", JSON.stringify(error, null, 2));
        res.status(500).json({
            error: "Error al crear la preferencia de pago",
            detalle: error.message
        });
    }
}

export const recibirWebhook = async (req, res) => {
    try {
        const paymentId = req.query.id || req.body.data?.id;
        const topic = req.query.topic || req.body.type;

        if (topic === 'payment') {
            const payment = new Payment(client);
            const pagoInfo = await payment.get({ id: paymentId });

            const userId = Number(pagoInfo.external_reference);
            const totalPagado = pagoInfo.transaction_amount;
            const estadoReal = mapearEstadoMP(pagoInfo.status);

            if (pagoInfo.status === 'rejected' || pagoInfo.status === 'cancelled') {
                return res.status(200).send("Notificación procesada: Pago rechazado");
            }

            if (['approved', 'pending', 'in_process'].includes(pagoInfo.status)) {
                try {
                    const nuevaFacturaId = await ModelFactura.createFactura({
                        usuario_id: userId,
                        total: totalPagado,
                        mp_payment_id: paymentId,
                        estado: estadoReal
                    });

                    const idFacturaSeguro = Number(nuevaFacturaId);
                    const usuario = await UsuarioModel.getbyId(userId);
                    const itemsComprados = await ModelCarrito.getCarrito(userId);

                    if (!itemsComprados || itemsComprados.length === 0) {
                        console.warn(`⚠️ Alerta: El carrito del usuario ${userId} ya estaba vacío al procesar la factura.`);
                    } else {
                        
                        for (const item of itemsComprados) {
                            const productoCompleto = await ModelProductos.getById(item.producto_id);
                            
                            let listaCapacidades = [];
                            if (productoCompleto && productoCompleto.capacidad) {
                                try {
                                    listaCapacidades = typeof productoCompleto.capacidad === 'string'
                                        ? JSON.parse(productoCompleto.capacidad)
                                        : productoCompleto.capacidad;
                                } catch (e) {
                                    listaCapacidades = [];
                                }
                            }

                            // BLINDAJE idéntico para la factura
                            const capUsuario = item.capacidad ? String(item.capacidad).trim() : "";
                            const index = listaCapacidades.findIndex(cap => String(cap).trim() === capUsuario);
                            
                            let extra = 0;
                            if (index === 1) extra = 100;
                            if (index === 2) extra = 250;
                            if (index === 3) extra = 400;

                            const precioFinalItem = Number(item.precio || 0) + extra;

                            await ModelDetalleFactura.createDetalleFactura(
                                idFacturaSeguro,
                                item.producto_id,
                                item.cantidad,
                                precioFinalItem
                            );
                        }

                        if (pagoInfo.status === 'approved') {
                            await ModelCarrito.emptyCarrito(userId);
                            await enviarEmailCompra(usuario.email, {
                                nombreUsuario: usuario.nombre,
                                items: itemsComprados,
                                total: totalPagado, // MP ya cobró el total con el extra
                                mp_payment_id: paymentId,
                                facturaId: idFacturaSeguro,
                                estadoDePago: estadoReal,
                                fecha: new Date()
                            });
                        }
                    }

                } catch (dbError) {
                    if (dbError.code === 'SQLITE_CONSTRAINT' || dbError.message?.includes('UNIQUE')) {
                        // Manejo silencioso de actualizaciones (como lo configuramos antes)
                    } else {
                        throw dbError;
                    }
                }
            }
        }

        return res.status(200).send("Notificación recibida e internalizada correctamente");

    } catch (error) {
        console.error("❌ Error crítico al procesar el webhook de Mercado Pago:", error);
        return res.status(500).send("Error interno del servidor al procesar la pasarela");
    }
};