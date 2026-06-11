import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASS
    }
})

export const enviarCorreoVerificacion = async (emailDestino, codigo) => {
    const mailOptions = {
        // Asegúrate de que el formato del remitente coincida con el otro correo (los corchetes angulares < >)
        from: `"AirMobile Tienda" <${process.env.MAILER_EMAIL}>`,
        to: emailDestino,
        subject: "Verifica tu cuenta en AirMobile 📱",
        html: ` 
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 30px 20px; border-radius: 8px;">
                <h2 style="color: #2c3e50; text-align: center; margin-bottom: 25px;">¡Bienvenido a AirMobile!</h2>
                
                <p style="font-size: 16px; line-height: 1.5;">Hola,</p>
                <p style="font-size: 16px; line-height: 1.5;">Gracias por registrarte o actualizar tu correo. Para continuar y asegurar tu cuenta, por favor ingresa el siguiente código de verificación en la aplicación:</p>
                
                <div style="background-color: #f4f7fa; border: 2px dashed #bcdcff; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #0d6efd; letter-spacing: 6px;">${codigo}</span>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5;">Si no solicitaste este código, puedes ignorar este mensaje de forma segura.</p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

                <p style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
                    Saludos,<br>
                    <strong>El equipo de AirMobile 📱</strong>
                </p>
            </div>
        `
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Codigo de verificacion enviado a: ${emailDestino}`);
        return true;
    } catch (error) {
        console.error("Error al enviar el email de verificacion:", error);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
}

export const enviarEmailConfirmacionPassword = async (emailDestino, nombre) => {
    const mailOptions = {
        from: `"AirMobile Tienda" <${process.env.MAILER_EMAIL}>`,
        to: emailDestino,
        subject: "Tu contraseña ha sido actualizada 🔒 | AirMobile",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2c3e50; text-align: center;">¡Cambio exitoso!</h2>
                
                <p>Hola, ${nombre}</p>
                <p>Te escribimos para confirmarte que <strong>la contraseña de tu cuenta en AirMobile ha sido actualizada correctamente.</strong></p>
                <p>Ya podés iniciar sesión y seguir viendo nuestros productos con tu nueva clave.</p>

                <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                    Saludos,<br>
                    <strong>El equipo de AirMobile 📱</strong>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email de confirmación de cambio enviado a: ${emailDestino}`);
        return true;
    } catch (error) {
        // En este caso solo hacemos un console.error. 
        // No queremos lanzar un "throw" porque la contraseña YA se cambió en la base de datos, 
        // y no queremos que el usuario reciba un error en la pantalla si solo falló el envío del mail.
        console.error("Error al enviar el email de confirmación:", error);
        return false;
    }
}
export const enviarEmailRecuperacion = async (emailDestino, codigoReseteo) => {
    const mailOptions = {
        from: `"AirMobile Tienda" <${process.env.MAILER_EMAIL}>`,
        to: emailDestino,
        subject: "Tu código de recuperación | AirMobile 📱",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2c3e50; text-align: center;">Recuperación de contraseña</h2>

                <p>Hola,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>AirMobile</strong>.</p>
                <p>Para continuar con el proceso, por favor ingresá el siguiente código de verificación en la página:</p>

                <!-- Caja destacada para el código -->
                <div style="background-color: #f8f9fa; border: 2px dashed #007bff; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <span style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 8px;">${codigoReseteo}</span>
                </div>

                <p style="font-size: 14px; color: #555; text-align: center;">
                    <em>Este código es de un solo uso</em>
                </p>

                <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                    Saludos,<br>
                    <strong>El equipo de AirMobile 📱</strong>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email de recuperación enviado exitosamente a: ${emailDestino}`);
        return true;
    } catch (error) {
        console.error("Error al enviar el email de recuperación:", error);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
}

export const enviarCorreoBlanqueo = async (emailDestino, nombre, passwordTemporal) => {
    const mailOptions = {
        // Usamos tu variable MAILER_EMAIL para mantener la consistencia
        from: `"Seguridad AirMobile" <${process.env.MAILER_EMAIL}>`,
        to: emailDestino,
        subject: "Restablecimiento de Credenciales 🔐 | AirMobile",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2c3e50; text-align: center;">AirMobile - Seguridad del Sistema</h2>
                
                <p>Hola, ${nombre}</p>
                <p>Un administrador del sistema ha ejecutado un restablecimiento de emergencia para tu contraseña de acceso al panel de gestión.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #3182ce; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; font-weight: bold;">Tu contraseña temporal es:</p>
                    <p style="margin: 10px 0 0 0; font-size: 22px; font-weight: bold; color: #2b6cb0; letter-spacing: 2px;">
                        ${passwordTemporal}
                    </p>
                </div>

                <p style="font-size: 15px; color: #4a5568;">
                    <strong>⚠️ Acción Requerida:</strong> Por políticas de seguridad, te pedimos que inicies sesión inmediatamente con esta clave temporal y la actualices desde la configuración de tu perfil.
                </p>

                <p style="margin-top: 30px; font-size: 13px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
                    Este es un mensaje automático generado por el módulo administrativo de AirMobile.<br>Por favor, no respondas a este correo.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de blanqueo de emergencia enviado a: ${emailDestino}`);
        return true;
    } catch (error) {
        console.error("Error al enviar el email de blanqueo de staff:", error);
        throw new Error("No se pudo enviar el correo de recuperación al administrador.");
    }
}


export const enviarEmailCompra = async (emailDestino, datosCompra) => {
    const { nombreUsuario, items, total, mp_payment_id, facturaId, fecha } = datosCompra;

    const itemsHTML = items.map(item => {
        // Parsear el string para obtener el array de URLs y tomar la primera
        let imagenUrl = '';
        try {
            const imagenesArray = JSON.parse(item.imagen_url);
            imagenUrl = Array.isArray(imagenesArray) ? imagenesArray[0] : item.imagen_url;
        } catch {
            imagenUrl = item.imagen_url; // Si falla el parse, usar tal cual
        }

        return `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding-right: 10px; vertical-align: middle;">
                            <img 
                                src="${imagenUrl}" 
                                alt="${item.nombre_producto}"
                                width="60" 
                                height="60"
                                style="object-fit: cover; border-radius: 6px; border: 1px solid #eee; display: block;"
                            />
                        </td>
                        <td style="vertical-align: middle;">
                            ${item.nombre_producto}
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.precio).toLocaleString('es-AR')}</td>
        </tr>
    `;
    }).join('');

    const mailOptions = {
        from: `"AirMobile Tienda" <${process.env.MAILER_EMAIL}>`,
        to: emailDestino,
        subject: "¡Compra confirmada! | AirMobile 📱",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2c3e50; text-align: center;">¡Tu compra fue exitosa! 🎉</h2>

                <p>Hola, <strong>${nombreUsuario}</strong></p>
                <p>Gracias por tu compra en <strong>AirMobile</strong>. A continuación encontrás el detalle de tu pedido:</p>

                <!-- Detalle de productos -->
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #007bff; color: white;">
                            <th style="padding: 10px; text-align: left;">Producto</th>
                            <th style="padding: 10px; text-align: center;">Cantidad</th>
                            <th style="padding: 10px; text-align: right;">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>

                <!-- Total -->
                <div style="background-color: #f8f9fa; border: 2px solid #007bff; text-align: left; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 20px; font-weight: bold; color: #2c3e50;">
                        Total pagado: <span style="color: #007bff;">$${Number(total).toLocaleString('es-AR')}</span>
                    </span>
                </div>

                <!-- ID de pago -->
                <div style="background-color: #f8f9fa; border: 2px dashed #28a745; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #555;">Número de comprobante</p>
                    <span style="font-size: 18px; font-weight: bold; color: #28a745; letter-spacing: 4px;">#${mp_payment_id}</span>
                </div>

                <!-- ID de factura -->
                <div style="background-color: #f8f9fa; border: 2px dashed #17a2b8; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #555;">Número de factura</p>
                    <span style="font-size: 18px; font-weight: bold; color: #17a2b8; letter-spacing: 4px;">#${facturaId}</span>
                </div>

                <p style="font-size: 13px; color: #888; text-align: center;">
                    Fecha de compra: ${new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
                    Saludos,<br>
                    <strong>El equipo de AirMobile 📱</strong>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de compra enviado a: ${emailDestino}`);
        return true;
    } catch (error) {
        console.error("Error al enviar el email de compra:", error);
        throw new Error("No se pudo enviar el correo de la compra.");
    }
}