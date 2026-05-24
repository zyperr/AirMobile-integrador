import bcrypt from 'bcryptjs';
import { obtenerDb } from './config/conexion.js';
import dotenv from "dotenv";

dotenv.config()

const db = await obtenerDb();

const crearSuperAdmin = async () => {
    try {
        console.log("Iniciando la creación del Super Admin...");

        const emailAdmin = "admin@airmobile.com";
        const passwordPlana = process.env.ADMIN_PASSWORD; // Podés poner la clave que quieras
        const nombreAdmin = "Admin AirMobile";
        const rol = "admin";

        // 1. Verificamos si ya existe para no duplicarlo por error
        // Asumiendo que usas el cliente libsql/client de Turso
        const checkUser = await db.execute({
            sql: "SELECT * FROM usuarios WHERE email = ?",
            args: [emailAdmin]
        });

        if (checkUser.rows.length > 0) {
            console.log("⚠️ El Super Admin ya existe en la base de datos Turso.");
            process.exit(0);
        }

        // 2. Encriptamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(passwordPlana, salt);

        // 3. Insertamos el usuario con el rol de admin
        await db.execute({
            sql: `INSERT INTO usuarios (nombre, email, password, rol) 
                  VALUES (?, ?, ?, ?)`,
            args: [nombreAdmin, emailAdmin, passwordEncriptada, rol]
        });

        console.log("✅ ¡Super Admin creado con éxito!");
        console.log(`Email: ${emailAdmin}`);
        console.log("Ya podés iniciar sesión en la plataforma y usar el Módulo Staff.");
        
        process.exit(0); // Cierra el script
    } catch (error) {
        console.error("❌ Error al crear el Super Admin:", error);
        process.exit(1);
    }
};

crearSuperAdmin();