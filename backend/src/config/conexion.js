import { createClient } from "@libsql/client"
import dotenv from "dotenv";

dotenv.config();


export async function obtenerDb() {
    const turso = createClient({
        url : process.env.TURSO_URL_DEV,
        authToken: process.env.TURSO_TOKEN_DEV,
    })
    return turso
} 

