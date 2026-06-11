


import UsuarioModel  from "../models/modelUsuario.js";

import ModelCarrito from "../models/modelCarrito.js";
import ModelFactura from "../models/modelFactura.js";
import ModelDetalleFactura from "../models/modelDetalleFactura.js";

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';


const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-TU_TOKEN_DE_PRUEBA' 
});


export const crearPreferencia = async (req, res) => {
    try{

        const userId = req.user.id; // ID del usuario autenticado


        if(!userId) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }


        const carritoItems = await ModelCarrito.getCarritoByUsuarioId(userId);

        const itemsMercadoPago = carritoItems.map(item =>({
            title: item.nombre_producto,
            unit_price: Number(item.precio_unitario),
            quantity: Number(item.cantidad),
            currency_id: "ARS",
        }));

        const preference = new Preference(client);

        const result = await preference.create({
            items: itemsMercadoPago,
            external_reference: userId.toString(),
            back_urls: {
                success: "http://localhost:5173/pago-exitoso",
                failure: "http://localhost:5173/pago-fallido",
                pending: "http://localhost:5173/pago-pendiente",
            },
            auto_return: "approved",
            notification_url: "http://localhost:3000/api/pagos/webhook",
        
        });


        return res.json({ exito: true, init_point: result.body.init_point });


    }catch(error) {
        console.error("Error al crear la preferencia de pago:", error);
        res.status(500).json({ error: "Error al crear la preferencia de pago" });
    }
}



export const recibirWebhook = async (req, res) => {
    try {
        // MP manda el ID del pago en req.query.id o en req.body.data.id dependiendo del tipo de evento
        const paymentId = req.query.id || req.body.data?.id;
        const topic = req.query.topic || req.body.type;

        // Solo nos interesan los eventos de tipo 'payment'
        if (topic === 'payment') {
            
            // 1. Instanciamos el servicio de pagos y consultamos el estado real del pago a MP
            const payment = new Payment(client);
            const pagoInfo = await payment.get({ id: paymentId });

            // 2. Comprobamos si el pago fue aprobado
            if (pagoInfo.status === 'approved') {
                
                const userId = pagoInfo.external_reference; // Recuperamos el ID del usuario que guardamos antes
                const totalPagado = pagoInfo.transaction_amount;

                console.log(`¡Éxito! El usuario ${userId} pagó $${totalPagado}. ID de pago: ${paymentId}`);

                // ==========================================
                // LÓGICA DE TU NEGOCIO (BASE DE DATOS)
                // ==========================================
                // 1. Guardar la factura en la BD:
                 await ModelFactura.createFactura({ usuario_id: userId, total: totalPagado, mp_payment_id: paymentId, estado: 'completado' });
                
                
                // 2. Limpiar el carrito del usuario:
                await ModelCarrito.limpiarCarrito(userId);
                
            }
        }

        // Es obligatorio responder siempre un 200 rápido a Mercado Pago
        return res.status(200).send("Notificación recibida");

    } catch (error) {
        console.error("Error al procesar el webhook:", error);
        // Devolvemos 500 para que MP sepa que hubo un error y reintente enviar la notificación más tarde
        return res.status(500).send("Error interno del servidor");
    }
};