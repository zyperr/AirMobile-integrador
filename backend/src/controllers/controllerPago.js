import 'dotenv/config';
import UsuarioModel from "../models/modelUsuario.js";
import ModelCarrito from "../models/modelCarrito.js";
import ModelFactura from "../models/modelFactura.js";
import ModelDetalleFactura from "../models/modelDetalleFactura.js";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { enviarEmailCompra } from '../utils/mailer.js';


console.log("Token cargado:", process.env.MP_ACCESS_TOKEN ? "SÍ" : "NO");
// Configuración del cliente (Asegúrate de que la variable de entorno esté bien escrita)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-TU_TOKEN_DE_PRUEBA'
});

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
                auto_return: "approved"   // ← adentro de body
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

        if (topic === 'payment') {
            const payment = new Payment(client);
            const pagoInfo = await payment.get({ id: paymentId });

            if (pagoInfo.status === 'approved') {
                const userId = pagoInfo.external_reference;
                const totalPagado = pagoInfo.transaction_amount;

                console.log(`¡Éxito! El usuario ${userId} pagó $${totalPagado}. ID de pago: ${paymentId}`);

                // PREVENCIÓN DE DUPLICADOS: Verificar si esta factura ya existe.
                // Como configuraste mp_payment_id como UNIQUE, esto podría fallar si MP manda dos avisos rápidos.
                // Lo manejaremos dentro de un bloque try/catch específico para que no tire la aplicación.
                try {
                    // 1. Intentamos crear la factura
                    const nuevaFacturaId = await ModelFactura.createFactura({
                        usuario_id: userId,
                        total: totalPagado,
                        mp_payment_id: paymentId
                    });

                    const usuario = await UsuarioModel.getbyId(userId);
                    console.log(`Factura creada en BD con el ID interno: ${nuevaFacturaId}`);

                    // 2. SOLO SI LA FACTURA SE CREÓ (no hubo error de duplicado), procesamos los productos
                    const itemsComprados = await ModelCarrito.getCarrito(userId);

                    for (const item of itemsComprados) {
                        await ModelDetalleFactura.createDetalleFactura(
                            nuevaFacturaId,
                            item.producto_id,
                            item.cantidad,
                            item.precio
                        );
                    }

                    await ModelCarrito.emptyCarrito(userId);
                    console.log(`Carrito vaciado para el usuario ${userId}`);


                    await enviarEmailCompra(usuario.email, {
                        nombreUsuario: usuario.nombre,
                        items: itemsComprados,
                        total: totalPagado,
                        mp_payment_id: paymentId,
                        facturaId: nuevaFacturaId,  // 👈 agregá esto
                        fecha: new Date()
                    });
                } catch (dbError) {
                    // Aquí es donde capturamos el error de duplicado (Unique Constraint)
                    if (dbError.code === 'SQLITE_CONSTRAINT' || dbError.message.includes('UNIQUE')) {
                        console.warn(`⚠️ Aviso: El pago ${paymentId} ya fue procesado anteriormente. Ignorando.`);
                        // Aquí no hacemos nada, simplemente dejamos que el código termine y devuelva el 200 OK
                    } else {
                        console.error("Error crítico en base de datos:", dbError);
                    }
                }
            }
        }

        return res.status(200).send("Notificación recibida");

    } catch (error) {
        console.error("Error al procesar el webhook:", error);
        return res.status(500).send("Error interno del servidor");
    }
};