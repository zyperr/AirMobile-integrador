import { obtenerDb } from "./config/conexion.js";

async function testConnection() {
  try {
    console.log("⏳ Conectando a Turso...");
    const client = await obtenerDb();
    
    // Hacemos una consulta rápida para ver la estructura o los datos
    const result = await client.execute("SELECT * FROM usuarios");
    
    console.log("📊 Estado de la tabla (filas actuales):", result.rows.length);
    if (result.rows.length > 0) {
      console.log(result.rows);
    }

  } catch (error) {
    console.error("❌ Error de conexión o ejecución:", error.message);
  }
}

testConnection();