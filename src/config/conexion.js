import { createClient } from "@libsql/client"
import dotenv from "dotenv";

dotenv.config();


export async function obtenerDb() {
    const turso = createClient({
        url : "libsql://usuarios-zyperr.aws-us-east-1.turso.io",
        authToken: process.env.TURSO_TOKEN,
    })
    return turso
} 