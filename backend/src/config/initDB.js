import { obtenerDb } from "./conexion.js";

export const inicializarBaseDeDatos = async () => {
    const db = await obtenerDb();

    const queryUsuarios = `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT DEFAULT 'cliente',
        verificado TEXT DEFAULT 'falso',
        codigo_verificacion TEXT
    )`;

    
    const queryProductos = `CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_producto TEXT NOT NULL,
        precio REAL NOT NULL CHECK (precio > 0),
        capacidad TEXT,
        descripcion TEXT, 
        imagen_url TEXT,
        categoria TEXT NOT NULL,
        condicion TEXT NOT NULL CHECK (condicion IN ('nuevo', 'reacondicionado', 'usado'))
    )`;
    const queryCarrito =  `CREATE TABLE IF NOT EXISTS carrito(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER DEFAULT 1,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
    )`;

    const queryFacturas = `CREATE TABLE IF NOT EXISTS facturas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        total REAL NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        estado TEXT DEFAULT 'Completado',
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
        )`;

    const queryDetallesFactura = `CREATE TABLE IF NOT EXISTS detalles_factura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factura_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) 
    )`;

    try {
        await db.execute(queryCarrito)
        await db.execute(queryUsuarios);
        await db.execute(queryProductos);
        await db.execute(queryFacturas);
        await db.execute(queryDetallesFactura);
        
        console.log("✅ Base de datos y tablas inicializadas correctamente.");
        return true;

    } catch (error) {
        console.error("❌ Fallo al crear las tablas:", error);
        return false;
    }
}