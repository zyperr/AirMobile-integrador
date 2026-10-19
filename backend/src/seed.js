import bcrypt from 'bcryptjs';
import { obtenerDb } from './config/conexion.js';
import { inicializarBaseDeDatos } from './config/initDB.js';
import dotenv from 'dotenv';

dotenv.config();

const db = await obtenerDb();

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const insert = (sql, args) => db.execute({ sql, args });

const existe = async (tabla, campo, valor) => {
    const r = await db.execute({ sql: `SELECT id FROM ${tabla} WHERE ${campo} = ?`, args: [valor] });
    return r.rows.length > 0;
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

const seedAdmin = async () => {
    console.log('\n👤 Creando admin...');

    const email = 'admin@airmobile.com';
    const nombre = 'Admin AirMobile';
    const rol = 'admin';
    const verificado = 'verdadero';

    if (!process.env.ADMIN_PASSWORD) {
        console.error('❌ ADMIN_PASSWORD no definida en el .env');
        process.exit(1);
    }

    if (await existe('usuarios', 'email', email)) {
        console.log(`  ⚠️  El admin ya existe, se omite.`);
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    await insert(
        `INSERT INTO usuarios (nombre, email, password, rol, verificado) VALUES (?, ?, ?, ?, ?)`,
        [nombre, email, hash, rol, verificado]
    );

    console.log(`  ✅ Admin creado → ${email}`);
};

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────

const seedProductos = async () => {
    console.log('\n📦 Creando productos...');

    const productos = [
        {
            nombre_producto: 'iPhone 15 Pro Max',
            precio: 1400,
            capacidad: JSON.stringify(['256GB', '512GB', '1TB']),
            descripcion: 'Pantalla Super Retina XDR 6.7", chip A17 Pro, cámara de 48MP con zoom óptico 5x, titanio.',
            imagen_url: JSON.stringify([]),
            categoria: 'celulares',
            condicion: 'nuevo',
            bateria: null,
        },
        {
            nombre_producto: 'iPhone 13',
            precio: 580,
            capacidad: JSON.stringify(['128GB', '256GB', '512GB']),
            descripcion: 'Pantalla Super Retina XDR 6.1", chip A15 Bionic, sistema de cámara dual mejorado.',
            imagen_url: JSON.stringify([]),
            categoria: 'celulares',
            condicion: 'reacondicionado',
            bateria: 90,
        },
        {
            nombre_producto: 'iPhone 11',
            precio: 320,
            capacidad: JSON.stringify(['64GB', '128GB']),
            descripcion: 'Pantalla Liquid Retina 6.1", chip A13 Bionic, cámara dual de 12MP.',
            imagen_url: JSON.stringify([]),
            categoria: 'celulares',
            condicion: 'usado',
            bateria: 80,
        },
        {
            nombre_producto: 'iPad Air 5ta Gen',
            precio: 750,
            capacidad: JSON.stringify(['64GB', '256GB']),
            descripcion: 'Pantalla Liquid Retina 10.9", chip M1, compatible con Apple Pencil 2da gen.',
            imagen_url: JSON.stringify([]),
            categoria: 'tablets',
            condicion: 'nuevo',
            bateria: null,
        },
        {
            nombre_producto: 'Apple Watch Series 9',
            precio: 450,
            capacidad: JSON.stringify([]),
            descripcion: 'Pantalla Retina siempre activa, chip S9, doble toque, resistencia al agua WR50.',
            imagen_url: JSON.stringify([]),
            categoria: 'relojes',
            condicion: 'nuevo',
            bateria: null,
        },
        {
            nombre_producto: 'AirPods Pro 2da Gen',
            precio: 280,
            capacidad: JSON.stringify([]),
            descripcion: 'Cancelación activa de ruido, audio adaptativo, chip H2, resistencia al agua IPX4.',
            imagen_url: JSON.stringify([]),
            categoria: 'auriculares',
            condicion: 'nuevo',
            bateria: null,
        },
        {
            nombre_producto: 'Funda Silicona iPhone 15 Pro',
            precio: 28,
            capacidad: JSON.stringify([]),
            descripcion: 'Funda de silicona suave compatible con MagSafe, disponible en varios colores.',
            imagen_url: JSON.stringify([]),
            categoria: 'fundas',
            condicion: 'nuevo',
            bateria: null,
        },
        {
            nombre_producto: 'AirTag (pack x4)',
            precio: 95,
            capacidad: JSON.stringify([]),
            descripcion: 'Rastreador de precisión con chip U1, red Dónde está, batería CR2032 reemplazable.',
            imagen_url: JSON.stringify([]),
            categoria: 'accesorios',
            condicion: 'nuevo',
            bateria: null,
        },
    ];

    for (const p of productos) {
        if (await existe('productos', 'nombre_producto', p.nombre_producto)) {
            console.log(`  ⚠️  Ya existe: ${p.nombre_producto}, se omite.`);
            continue;
        }

        await insert(
            `INSERT INTO productos (nombre_producto, precio, capacidad, descripcion, imagen_url, categoria, condicion, bateria)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.nombre_producto, p.precio, p.capacidad, p.descripcion, p.imagen_url, p.categoria, p.condicion, p.bateria]
        );

        console.log(`  ✅ ${p.nombre_producto}`);
    }
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

try {
    console.log('🌱 Iniciando seed...');

    await inicializarBaseDeDatos();
    await seedAdmin();
    await seedProductos();

    console.log('\n✅ Seed completado.');
    console.log('\n📋 Credenciales admin:');
    console.log('   Email    → admin@airmobile.com');
    console.log('   Password → (ADMIN_PASSWORD del .env)');

    process.exit(0);
} catch (error) {
    console.error('\n❌ Error en el seed:', error);
    process.exit(1);
}