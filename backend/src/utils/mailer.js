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
        from: `"AirMobile TIenda" ${process.env.MAILER_EMAIL}`,
        to: emailDestino,
        subject: "Verifica tu cuenta en AirMobile 📱",
        html: ` 
            <h1>¡Bienvenido a AirMobile!</h1>
            <p>Tu código de verificación es: <strong>${codigo}</strong></p>
            <p>Ingresa este código en la aplicación para activar tu cuenta.</p>
        `
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Codigo de verificacion enviado  a: ${emailDestino}`);
        return true;
    } catch (error) {
        console.error("Error al enviar el email de verificacion:", error);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
}

export const enviarEmailConfirmacionPassword = async (emailDestino,nombre) => {
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