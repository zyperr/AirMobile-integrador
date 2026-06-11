import UsuarioModel from "../models/modelUsuario.js";
import ModelCarrito from "../models/modelCarrito.js";
import ModelFactura from "../models/modelFactura.js";
import ModelDetalleFactura from "../models/modelDetalleFactura.js";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuración del cliente (Asegúrate de que la variable de entorno esté bien escrita)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-TU_TOKEN_DE_PRUEBA'
});

export const crearPreferencia = async (req, res) => {
    try {
        const userId = req.user.id; 

        // Verificación rápida para asegurarnos de que el usuario existe (aunque el middleware ya lo hizo, nunca está de más)
        const usuario = await UsuarioModel.getUsuarioById(userId);
        if (!usuario) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const carritoItems = await ModelCarrito.getCarritoByUsuarioId(userId);

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

        const result = await preference.create({
            body: {
                items: itemsMercadoPago,
                external_reference: userId.toString(),
                back_urls: {
                    success: "http://localhost:5173/pago-exitoso",
                    failure: "http://localhost:5173/pago-fallido",
                    pending: "http://localhost:5173/pago-pendiente",
                },
                auto_return: "approved",
                // Debes usar una URL PÚBLICA aquí si vas a probar desde Mercado Pago real. 
                // "localhost" no funcionará porque MP no puede ver dentro de tu computadora. 
                // Necesitas usar Ngrok (ej: "https://tucodigo.ngrok.io/api/pagos/webhook")
                notification_url: "https://TU_URL_PUBLICA/api/pagos/webhook", 
            }
        });

        // result.id también sirve, o init_point
        return res.json({ exito: true, init_point: result.init_point }); 

    } catch (error) {
        console.error("Error al crear la preferencia de pago:", error);
        res.status(500).json({ error: "Error al crear la preferencia de pago" });
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
                    const nuevaFacturaId = await ModelFactura.createFactura({
                        usuario_id: userId,
                        total: totalPagado,
                        mp_payment_id: paymentId 
                    });

                    console.log(`Factura creada en BD con el ID interno: ${nuevaFacturaId}`);

                    const itemsComprados = await ModelCarrito.getCarritoByUsuarioId(userId);

                    for (const item of itemsComprados) {
                        await ModelDetalleFactura.createDetalleFactura( // Ajustado a los argumentos que definiste antes
                            nuevaFacturaId,
                            item.producto_id,
                            item.cantidad,
                            item.precio_unitario // O item.precio, según como lo devuelva tu BD
                        );
                    }

                    await ModelCarrito.limpiarCarrito(userId);

                } catch (dbError) {
                    // Si el error es de restricción UNIQUE (ej. SQLITE_CONSTRAINT), ignoramos, porque significa que ya la creamos
                    if (dbError.code === 'SQLITE_CONSTRAINT' || dbError.code === 'ER_DUP_ENTRY') {
                        console.log(`Aviso duplicado ignorado para el pago ${paymentId}`);
                    } else {
                        console.error("Error en base de datos al procesar el pago:", dbError);
                        // ¡OJO! No disparamos un error 500 aquí para MP, porque el problema fue nuestro (BD), no de ellos.
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