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

    await transporter.sendMail(mailOptions);
}