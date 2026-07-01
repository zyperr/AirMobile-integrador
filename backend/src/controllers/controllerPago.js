import 'dotenv/config';
import UsuarioModel from "../models/modelUsuario.js";
import ModelCarrito from "../models/modelCarrito.js";
import ModelFactura from "../models/modelFactura.js";
import ModelDetalleFactura from "../models/modelDetalleFactura.js";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { enviarEmailCompra } from '../utils/mailer.js';
import { ESTADOS } from '../utils/estados.js';


console.log("Token cargado:", process.env.MP_ACCESS_TOKEN ? "SÍ" : "NO");
// Configuración del cliente (Asegúrate de que la variable de entorno esté bien escrita)
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
    return mapa[estadoMP] || ESTADOS.PENDIENTE; // fallback por si llega algo inesperado
};
export const crearPreferencia = async (req, res) => {
    try {
        const userId = req.user.id;

        // Verificación rápida para asegurarnos de que el usuario existe (aunque el middleware ya lo hizo, nunca está de más)
        const usuario = await UsuarioModel.getbyId(userId);
        if (!usuario) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const carritoItems = await ModelCarrito.getCarrito(userId);

        //Qué pasa si el carrito está vacío? Mejor prevenir que curar
        if (!carritoItems || carritoItems.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        const itemsMercadoPago = carritoItems.map(item => ({
            title: item.nombre_producto,
            unit_price: Number(item.precio_unitario || item.precio), // Asegúrate de que el nombre del campo coincida con tu BD
            quantity: Number(item.cantidad),
            currency_id: "ARS",
        }));

        const preference = new Preference(client);

        console.log("Items a enviar a MP:", JSON.stringify(itemsMercadoPago, null, 2));

        const result = await preference.create({
            body: {
                items: itemsMercadoPago,
                external_reference: userId.toString(),
                notification_url: "https://estrogen-spry-brunette.ngrok-free.dev/api/pagos/webhook",
                back_urls: {        // ← adentro de body
                    success: "localhost:5173/pago-exitoso",
                    failure: "localhost:5173/pago-fallido",
                    pending: "localhost:5173/pago-pendiente"
                },
                auto_return: "all"   // ← adentro de body
            }
        });
        // result.id también sirve, o init_point

        console.log("Respuesta completa de MP:", JSON.stringify(result, null, 2));
        console.log("init_point:", result.init_point);

        return res.json({ exito: true, init_point: result.init_point });

    } catch (error) {
        console.error("Error completo:", JSON.stringify(error, null, 2));
        console.error("Mensaje:", error.message);
        console.error("Status:", error.status);
        console.error("Causa:", error.cause);
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

        // Validamos que el webhook sea exclusivamente de un pago
        if (topic === 'payment') {
            const payment = new Payment(client);
            const pagoInfo = await payment.get({ id: paymentId });

            // Forzamos el ID a Número para evitar fallos de coincidencia de tipos en las consultas SQL
            const userId = Number(pagoInfo.external_reference);
            const totalPagado = pagoInfo.transaction_amount;
            const estadoReal = mapearEstadoMP(pagoInfo.status);

            console.log(`[Webhook] Procesando Pago ID: ${paymentId} | Usuario: ${userId} | Estado MP: ${pagoInfo.status}`);

            // CASO 1: El pago fue rechazado o cancelado de entrada.
            // Protegemos el carrito para que el usuario no pierda su selección y pueda reintentar.
            if (pagoInfo.status === 'rejected' || pagoInfo.status === 'cancelled') {
                console.log(`❌ Pago fallido o rechazado de origen. El carrito del usuario ${userId} permanece intacto.`);
                return res.status(200).send("Notificación procesada: Pago rechazado");
            }

            // CASO 2: El pago está aprobado, pendiente o en proceso de revisión.
            if (['approved', 'pending', 'in_process'].includes(pagoInfo.status)) {
                try {
                    // 1. Intentamos registrar la factura inicial en la base de datos
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
                        // 2. Registramos los detalles de los productos comprados en el historial
                        for (const item of itemsComprados) {
                            await ModelDetalleFactura.createDetalleFactura(
                                idFacturaSeguro,
                                item.producto_id,
                                item.cantidad,
                                item.precio
                            );
                        }

                        // 3. Vaciamos el carrito en la Base de Datos para asegurar la orden (aplica a aprobado y pendiente)
                        await ModelCarrito.emptyCarrito(userId);
                        console.log(`✅ Orden generada con éxito (${pagoInfo.status}). Carrito vaciado para el usuario ${userId}`);

                        // 4. Despachamos el correo adaptado con el estado del pago
                        await enviarEmailCompra(usuario.email, {
                            nombreUsuario: usuario.nombre,
                            items: itemsComprados,
                            total: totalPagado,
                            mp_payment_id: paymentId,
                            facturaId: idFacturaSeguro,
                            estadoDePago: estadoReal, // Envía si está COMPLETO o PENDIENTE para la plantilla
                            fecha: new Date()
                        });
                    }

                } catch (dbError) {
                    // CASO 3: Manejo de la Condición de Carrera / Actualizaciones posteriores (UNIQUE Constraint)
                    // Si la factura ya existía (ej: pasó de 'pending' a 'approved' cuando el usuario fue al Rapipago)
                    if (dbError.code === 'SQLITE_CONSTRAINT' || dbError.message?.includes('UNIQUE')) {
                        console.log(`⚡ El registro del pago ${paymentId} ya existía. Evaluando actualización de estado...`);
                        
                        if (pagoInfo.status === 'approved') {
                            // TODO: Si tienes un método en tu modelo para cambiar el estado, ejecútalo aquí
                            // Ejemplo: await ModelFactura.updateEstadoByPaymentId(paymentId, ESTADOS.COMPLETADO);
                            console.log(`🎉 ¡Confirmado! El usuario abonó el ticket pendiente. Factura actualizada a COMPLETADO.`);
                        } 
                        else if (pagoInfo.status === 'cancelled' || pagoInfo.status === 'rejected') {
                            // El ticket en efectivo caducó o el pago en revisión fue denegado posteriormente
                            // Ejemplo: await ModelFactura.updateEstadoByPaymentId(paymentId, ESTADOS.CANCELADO);
                            console.log(`❌ El pago pendiente fue cancelado o expiró de forma definitiva.`);
                        }
                    } else {
                        // Si es otro error de base de datos totalmente diferente, lo lanzamos al catch general
                        throw dbError;
                    }
                }
            }
        }

        // Importante: Siempre responder 200 a Mercado Pago para confirmar recepción de la alerta
        return res.status(200).send("Notificación recibida e internalizada correctamente");

    } catch (error) {
        console.error("❌ Error crítico al procesar el webhook de Mercado Pago:", error);
        return res.status(500).send("Error interno del servidor al procesar la pasarela");
    }
};