# 📱 AirMobile — Tienda de Dispositivos Apple

> E-commerce fullstack especializado en iPhones, iPads, Apple Watch, AirPods y accesorios. Incluye asistente virtual con IA integrado vía N8N.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [API — Endpoints](#api--endpoints)
- [Funcionalidades](#funcionalidades)
- [Asistente Virtual (N8N + Ollama)](#asistente-virtual-n8n--ollama)
  - [Instalación de Ollama](#1-instalación-de-ollama)
  - [Descargar el modelo Qwen3:8b](#2-descargar-el-modelo-qwen38b)
  - [Correr N8N](#3-correr-n8n)
  - [Configuración del workflow](#4-configuración-del-workflow)

---

## Descripción

**AirMobile** es una tienda online fullstack orientada a la venta de dispositivos Apple (nuevos y usados/reacondicionados) y sus accesorios. Ofrece:

- Catálogo con filtros avanzados de búsqueda
- Gestión de carrito de compras y lista de deseados
- Sistema de facturación con descarga de PDF
- Panel de administración para gestión de productos y staff
- Registro/login con verificación de cuenta por email
- Recuperación de contraseña por correo
- **Sistema de autenticación seguro con access token (15 min) + refresh token (7 días) con rotación automática**
- Chat con asistente virtual impulsado por IA conectado a la base de datos real de productos

---

## Tecnologías

### Backend
| Tecnología | Uso |
|---|---|
| Node.js + Express 5 | Servidor HTTP y routing |
| Turso (LibSQL) | Base de datos SQL en la nube |
| Cloudinary | Almacenamiento de imágenes de productos |
| Nodemailer | Envío de emails (verificación y recuperación de contraseña) |
| JWT (jsonwebtoken) | Access tokens de corta duración (15 min) |
| bcryptjs | Hash de contraseñas |
| Joi | Validación de schemas de entrada |
| Multer | Subida de archivos (imágenes y CSV) |
| PDFKit | Generación de facturas en PDF |
| ExcelJS + csv-parser | Carga masiva de productos |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 + Vite | UI y bundler |
| React Router DOM 7 | Navegación SPA |
| React Hook Form | Formularios |
| Bootstrap 5 | Estilos y componentes UI |
| react-markdown | Renderizado de respuestas del chatbot |
| N8N (webhook) | Asistente virtual con IA |

---

## Estructura del Proyecto

```
AirMobile-integrador/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── conexion.js          # Conexión a Turso (LibSQL)
│       │   ├── cloudinarySetup.js   # Configuración de Cloudinary
│       │   └── initDB.js            # Inicialización de tablas
│       ├── controllers/             # Lógica de negocio
│       │   ├── controlerUsuario.js  # login, registro, refresh, logout
│       │   ├── controllerCarrito.js
│       │   ├── controllerFactura.js
│       │   ├── controllerListaDeseados.js
│       │   ├── controllerPassword.js
│       │   ├── controllerProductos.js
│       │   └── controllerStaff.js
│       ├── middlewares/
│       │   ├── authMiddleware.js    # Verificación JWT (401 en token inválido)
│       │   ├── verificarAdmin.js    # Control de rol admin
│       │   ├── multer.js            # Subida de archivos
│       │   └── fileFilter.js        # Filtro de tipos de imagen
│       ├── models/                  # Queries a la base de datos
│       │   ├── modelUsuario.js
│       │   ├── modelProductos.js
│       │   ├── modelCarrito.js
│       │   ├── modelFactura.js
│       │   ├── modelDetalleFactura.js  # Separado de modelFactura
│       │   ├── modelListaDeseados.js
│       │   ├── modelStaff.js
│       │   └── modelToken.js           # Gestión de refresh tokens
│       ├── routes/                  # Definición de rutas
│       ├── schemas/                 # Validaciones Joi
│       │   ├── schemaProductos.js
│       │   ├── schemaUpdateProducto.js
│       │   ├── schemaQueriesFiltros.js
│       │   ├── schemaRegistroUsuario.js
│       │   ├── schemaLoginUsuarios.js
│       │   ├── schemaUpdateUsuario.js
│       │   ├── schemaVerificacion.js
│       │   ├── schemaResetPassword.js
│       │   ├── schemaRefreshToken.js   # Validación de tokens
│       │   └── schemaStaff.js
│       ├── utils/
│       │   ├── mailer.js
│       │   ├── descargarFacturaPDF.js
│       │   ├── manejarImagenes.js
│       │   ├── leerArchivos.js
│       │   ├── estados.js
│       │   └── roles.js
│       ├── seed.js
│       └── index.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── admin/
│       │   ├── chat/
│       │   ├── common/
│       │   ├── layout/
│       │   └── productos/
│       ├── context/
│       │   ├── AuthContext.jsx      # Maneja access + refresh token + usuario
│       │   └── CarritoContext.jsx
│       ├── hooks/
│       │   ├── useApi.js            # Con interceptor automático de renovación
│       │   └── useN8nChat.js
│       ├── pages/
│       ├── style/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── package.json
├── vite.config.js
└── .env
```

---

## Variables de Entorno

Crear un archivo `.env` en la **raíz del proyecto** con las siguientes variables:

```env
# Base de datos — Turso
TURSO_TOKEN =

# Autenticación JWT
SECRET_KEY =

# Nodemailer — Gmail
MAILER_PASS =
MAILER_EMAIL =

# Cloudinary — Imágenes
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Panel de administración
ADMIN_PASSWORD =

# N8N — Asistente Virtual
VITE_N8N_WEBHOOK_URL=
VITE_TEST_N8N=
```

> ⚠️ **Importante:** Las variables que comienzan con `VITE_` son accesibles desde el frontend. Nunca expongas claves privadas con ese prefijo.

### Descripción de cada variable

| Variable | Descripción |
|---|---|
| `TURSO_TOKEN` | Token de autenticación de la base de datos Turso |
| `SECRET_KEY` | Clave secreta para firmar y verificar los access tokens JWT |
| `MAILER_EMAIL` | Dirección Gmail desde la que se envían los correos |
| `MAILER_PASS` | Contraseña de aplicación de Gmail |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `ADMIN_PASSWORD` | Contraseña inicial del administrador (usada en seed) |
| `VITE_N8N_WEBHOOK_URL` | URL del webhook de N8N para el asistente virtual |
| `VITE_TEST_N8N` | URL alternativa de N8N para entorno de pruebas |

---

## Instalación y Ejecución

### Prerequisitos

- Node.js 18+
- Cuenta en [Turso](https://turso.tech/)
- Cuenta en [Cloudinary](https://cloudinary.com/)
- Cuenta en Gmail con contraseña de aplicación habilitada
- [Ollama](https://ollama.com/) instalado con el modelo `qwen3:8b` descargado (ver [sección del asistente](#asistente-virtual-n8n--ollama))
- [N8N](https://n8n.io/) corriendo localmente con el workflow configurado (ver [sección del asistente](#asistente-virtual-n8n--ollama))

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/zyperr/AirMobile-integrador.git
cd AirMobile-integrador

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env en la raíz con las variables indicadas arriba

# 4. Inicializar la base de datos y cargar datos de prueba
npm run dev:seed

# 5. Ejecutar el backend (en una terminal)
npm run dev:backend

# 6. Ejecutar el frontend (en otra terminal)
npm run dev:frontend
```

El backend corre en `http://localhost:3000` y el frontend en `http://localhost:5173`.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev:backend` | Inicia el servidor Express con hot-reload |
| `npm run dev:frontend` | Inicia el servidor de desarrollo Vite |
| `npm run dev:seed` | Carga datos iniciales en la base de datos |
| `npm run build` | Genera el build de producción del frontend |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint |

---

## API — Endpoints

Base URL: `http://localhost:3000/api`

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <accessToken>
```

### Usuarios — `/api/usuarios`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `GET` | `/usuarios` | No | Listar todos los usuarios |
| `POST` | `/registro` | No | Registrar nuevo usuario |
| `POST` | `/login` | No | Iniciar sesión → devuelve `accessToken` (15 min) + `refreshToken` (7 días) |
| `POST` | `/refresh` | No | Renovar sesión con refresh token → rota ambos tokens |
| `POST` | `/logout` | No | Revocar refresh token y cerrar sesión |
| `POST` | `/verificar` | ✅ Token | Verificar cuenta con código de 6 dígitos |
| `PUT` | `/actualizar` | ✅ Token | Actualizar contraseña |
| `PUT` | `/actualizar-nombre` | ✅ Token | Actualizar nombre de usuario |
| `GET` | `/perfil` | ✅ Token | Verificar token activo |
| `GET` | `/mi-perfil` | ✅ Token | Obtener datos del perfil |

### Productos — `/api/productos`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `GET` | `/productos` | No | Listar productos con filtros y paginación |
| `GET` | `/:id` | No | Obtener un producto por ID |
| `POST` | `/agregar-producto` | ✅ Admin | Crear producto (con imágenes, máx. 3) |
| `PUT` | `/actualizar-producto/:id` | ✅ Admin | Actualizar producto |
| `DELETE` | `/eliminar-producto/:id` | ✅ Admin | Eliminar producto (borrado lógico) |
| `POST` | `/carga-masiva` | ✅ Admin | Carga masiva desde CSV/Excel |

### Carrito — `/api/carrito`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `GET` | `/` | ✅ Token | Obtener carrito del usuario |
| `POST` | `/agregar-carrito/:id` | ✅ Token | Agregar producto al carrito |
| `DELETE` | `/eliminar-carrito/:id` | ✅ Token | Reducir cantidad en 1 |
| `DELETE` | `/eliminar-producto-completo/:id` | ✅ Token | Eliminar producto completamente |
| `DELETE` | `/vaciar-carrito` | ✅ Token | Vaciar todo el carrito |

### Lista de Deseados — `/api/lista-deseados`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/agregar/:id` | ✅ Token | Agregar a lista de deseados |
| `GET` | `/obtener` | ✅ Token | Obtener lista de deseados |
| `DELETE` | `/eliminar/:id` | ✅ Token | Eliminar de la lista |
| `GET` | `/verificar/:id` | ✅ Token | Verificar si un producto está en la lista |

### Facturas — `/api/facturas`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/crear-factura` | ✅ Token | Crear factura desde el carrito |
| `GET` | `/obtener-factura/:id` | ✅ Token | Obtener una factura |
| `GET` | `/obtener-facturas` | ✅ Admin | Obtener todas las facturas del sistema |
| `PATCH` | `/:id/estado` | ✅ Admin | Actualizar el estado de una factura |
| `GET` | `/detalle-factura/:id` | ✅ Token | Detalle de una factura con productos |
| `GET` | `/detalle-factura/:id/pdf` | ✅ Token | Descargar factura como PDF |
| `GET` | `/obtener-facturas-usuario` | ✅ Token | Historial de facturas del usuario (con `fecha_formateada`) |

### Recuperación de Contraseña

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/recuperar-password` | Solicitar código de recuperación por email |
| `POST` | `/api/reset-password` | Restablecer contraseña con código |

### Staff / Admin — `/api/staff`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `GET` | `/` | ✅ Admin | Listar todos los miembros del staff |
| `POST` | `/registrar` | ✅ Admin | Registrar nuevo administrador |
| `PUT` | `/:id` | ✅ Admin | Actualizar datos del admin |
| `DELETE` | `/baja/:id` | ✅ Admin | Dar de baja a un miembro del staff |
| `PUT` | `/restaurar/:id` | ✅ Admin | Restaurar miembro dado de baja |
| `PUT` | `/reset-password/:id` | ✅ Admin | Blanquear contraseña de un admin |

---

## Funcionalidades

### Para usuarios

- **Registro y login** con verificación de cuenta por código enviado al email
- **Sesión segura** con access token de 15 minutos y refresh token de 7 días; renovación automática y transparente
- **Recuperación de contraseña** mediante código enviado al correo
- **Catálogo de productos** con filtros por categoría, condición, precio, capacidad, batería y búsqueda por texto
- **Detalle de producto** con galería de imágenes, selección de capacidad y productos relacionados
- **Carrito de compras** persistente
- **Lista de deseados** para guardar productos favoritos
- **Historial de facturas** con fechas formateadas y descarga en PDF
- **Perfil de usuario** editable (nombre y contraseña)

### Para administradores

- **Panel de gestión** de productos (alta, baja, modificación)
- **Carga masiva** de productos desde archivos CSV o Excel
- **Gestión de facturas** con posibilidad de cambiar el estado
- **Gestión de staff**: registrar, editar, dar de baja y restaurar administradores
- **Blanqueo de contraseñas** de otros admins

---

## Asistente Virtual (N8N + Ollama)

El proyecto incluye un chatbot flotante en toda la aplicación que conecta con un workflow de **N8N** orquestado localmente. El modelo de lenguaje que alimenta el asistente es **Qwen3:8b**, servido a través de **Ollama**.

El asistente está configurado como vendedor especializado de AirMobile con dos herramientas conectadas a la base de datos real:

- **Buscar Producto** — Se activa cuando el usuario menciona una categoría o modelo específico. Busca por nombre, modelo o categoría y devuelve precios e IDs.
- **Consultar Catálogo General** — Se activa ante consultas genéricas. Trae hasta 50 productos agrupados por categoría.

Las variables de entorno necesarias para el chat son:
- `VITE_N8N_WEBHOOK_URL` — URL del webhook de producción
- `VITE_TEST_N8N` — URL del webhook para pruebas/desarrollo

---

### 1. Instalación de Ollama

Descargá e instalá Ollama desde [https://ollama.com/download](https://ollama.com/download) según tu sistema operativo.

**Windows / macOS:** ejecutá el instalador descargado.

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Para verificar que está activo:
```bash
ollama --version
```

---

### 2. Descargar el modelo Qwen3:8b

```bash
ollama pull qwen3:8b
```

> La descarga pesa aproximadamente **5 GB**.

Para verificar que el modelo está disponible:
```bash
ollama list
```

Para iniciar Ollama manualmente si no corre como servicio:
```bash
ollama serve
```

---

### 3. Correr N8N

```bash
npx n8n
```

Esto levanta el editor de N8N en `http://localhost:5678`.

Si preferís instalarlo globalmente:
```bash
npm install -g n8n
n8n
```

---

### 4. Configuración del workflow

Una vez dentro del editor de N8N (`http://localhost:5678`):

1. Importá el workflow del proyecto.
2. Configurá el nodo de **Ollama** apuntando a `http://localhost:11434` y seleccionando el modelo `qwen3:8b`.
3. Configurá el nodo de **Webhook** como trigger y pegá la URL resultante en las variables de entorno:
   ```env
   VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/tu-id-de-webhook
   VITE_TEST_N8N=http://localhost:5678/webhook-test/tu-id-de-webhook
   ```
4. Conectá los tools a los endpoints del backend:
   - `GET http://localhost:3000/api/productos/productos`
   - `GET http://localhost:3000/api/productos/:id`
5. Activá el workflow con el switch **Active** en la esquina superior derecha.