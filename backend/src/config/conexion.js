import { createClient } from "@libsql/client"
import dotenv from "dotenv";

dotenv.config();


export async function obtenerDb() {
    const turso = createClient({
        // Acepta los nombres del README (TURSO_URL/TURSO_TOKEN) y los anteriores (*_DEV)
        url : process.env.TURSO_URL || process.env.TURSO_URL_DEV,
        authToken: process.env.TURSO_TOKEN || process.env.TURSO_TOKEN_DEV,
    })
    return turso
} 

