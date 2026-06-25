# 📱 AirMobile — Tienda de Dispositivos Apple

> E-commerce fullstack especializado en iPhones, iPads, Apple Watch, AirPods y accesorios. Incluye asistente virtual con IA integrado vía N8N y pagos con Mercado Pago.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación y Ejecución](#instalación-y-ejecución)
  - [Base de datos — desarrollo vs producción](#base-de-datos--desarrollo-vs-producción)
- [API — Endpoints](#api--endpoints)
- [Funcionalidades](#funcionalidades)
- [Pagos con Mercado Pago + ngrok](#pagos-con-mercado-pago--ngrok)
- [Asistente Virtual (N8N + Ollama)](#asistente-virtual-n8n--ollama)
  - [Instalación de Ollama](#1-instalación-de-ollama)
  - [Descargar el modelo qwen3:4b](#2-descargar-el-modelo-qwen34b)
  - [Correr N8N](#3-correr-n8n)
  - [Importar el workflow](#4-importar-el-workflow)

---

## Descripción

**AirMobile** es una tienda online fullstack orientada a la venta de dispositivos Apple (nuevos y usados/reacondicionados) y sus accesorios. Ofrece:

- Catálogo con filtros avanzados de búsqueda
- Gestión de carrito de compras y lista de deseados
- **Pagos reales con Mercado Pago** (Checkout Pro) con notificaciones webhook vía ngrok
- Sistema de facturación automático con descarga de PDF
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
| Turso (LibSQL) | Base de datos SQL en la nube (producción) |
| SQLite local (`@libsql/client`) | Base de datos local para desarrollo |
| Cloudinary | Almacenamiento de imágenes de productos |
| Nodemailer | Envío de emails (verificación, recuperación de contraseña, confirmación de compra) |
| JWT (jsonwebtoken) | Access tokens de corta duración (15 min) |
| bcryptjs | Hash de contraseñas |
| Joi | Validación de schemas de entrada |
| Multer | Subida de archivos (imágenes y CSV) |
| PDFKit | Generación de facturas en PDF |
| ExcelJS + csv-parser | Carga masiva de productos |
| **Mercado Pago SDK** | **Procesamiento de pagos (Checkout Pro + Webhooks)** |
| **ngrok** | **Exposición del servidor local para recibir webhooks de Mercado Pago** |

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
│   ├── dev.db                   # Base de datos SQLite local (desarrollo, ignorada por git)
│   └── src/
│       ├── config/
│       │   ├── conexion.js          # Conexión dinámica: Turso (prod) o SQLite local (dev)
│       │   ├── cloudinarySetup.js   # Configuración de Cloudinary
│       │   └── initDB.js            # Inicialización de tablas
│       ├── controllers/             # Lógica de negocio
│       │   ├── controlerUsuario.js  # login, registro, refresh, logout
│       │   ├── controllerCarrito.js
│       │   ├── controllerFactura.js
│       │   ├── controllerListaDeseados.js
│       │   ├── controllerPago.js    # Mercado Pago: preferencia + webhook
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
│       │   ├── modelFactura.js      # Incluye columna mp_payment_id (UNIQUE)
│       │   ├── modelDetalleFactura.js
│       │   ├── modelListaDeseados.js
│       │   ├── modelStaff.js
│       │   └── modelToken.js        # Gestión de refresh tokens
│       ├── routes/
│       │   ├── routesPagos.js       # POST /crear-preferencia, POST /webhook
│       │   └── ...
│       ├── schemas/                 # Validaciones Joi
│       ├── seed.js                  # Seed de desarrollo: crea tablas + admin + 8 productos
│       └── utils/
│           ├── mailer.js            # Incluye email de confirmación de compra
│           ├── estados.js           # Constantes de estado de factura
│           └── ...
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       │   ├── AuthContext.jsx      # Maneja access + refresh token + usuario
│       │   └── CarritoContext.jsx
│       ├── hooks/
│       │   ├── useApi.js            # Interceptor automático de renovación de sesión
│       │   └── useN8nChat.js
│       ├── pages/
│       │   ├── PagoExitoso.jsx
│       │   ├── PagoFallido.jsx
│       │   └── PagoPendiente.jsx
│       └── ...
├── ecommerce-chatbot-v4.json    # Workflow de N8N listo para importar
├── system_prompt.txt            # System prompt del asistente virtual
├── package.json
├── vite.config.js
└── .env
```

---

## Variables de Entorno

Crear un archivo `.env` en la **raíz del proyecto** con las siguientes variables:

```env
# Base de datos
# — Producción (Turso)
TURSO_URL=libsql://tu-db.aws-us-east-1.turso.io
TURSO_TOKEN=

# — Desarrollo local (SQLite) → comentá las de arriba y usá esta
# TURSO_URL=file:./backend/dev.db
# TURSO_TOKEN=

# Autenticación JWT
SECRET_KEY=

# Nodemailer — Gmail
MAILER_PASS=
MAILER_EMAIL=

# Cloudinary — Imágenes
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Panel de administración
ADMIN_PASSWORD=

# Mercado Pago
MP_ACCESS_TOKEN=

# N8N — Asistente Virtual
VITE_N8N_WEBHOOK_URL=
VITE_TEST_N8N=
```

> ⚠️ **Importante:** Las variables que comienzan con `VITE_` son accesibles desde el frontend. Nunca expongas claves privadas con ese prefijo.

### Descripción de cada variable

| Variable | Descripción |
|---|---|
| `TURSO_URL` | URL de la base de datos. `libsql://...` para Turso, `file:./backend/dev.db` para local |
| `TURSO_TOKEN` | Token de autenticación de Turso. Dejar vacío en desarrollo local |
| `SECRET_KEY` | Clave secreta para firmar y verificar los access tokens JWT |
| `MAILER_EMAIL` | Dirección Gmail desde la que se envían los correos |
| `MAILER_PASS` | Contraseña de aplicación de Gmail |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |
| `ADMIN_PASSWORD` | Contraseña del administrador creado por el seed |
| `MP_ACCESS_TOKEN` | Access token de Mercado Pago (productivo o de prueba) |
| `VITE_N8N_WEBHOOK_URL` | URL del webhook de N8N para el asistente virtual |
| `VITE_TEST_N8N` | URL alternativa de N8N para entorno de pruebas |

> 💡 **Nota sobre `MP_ACCESS_TOKEN`:** En desarrollo usá un token de prueba (`TEST-...`). En producción reemplazalo por el token productivo de tu aplicación en el [panel de Mercado Pago](https://www.mercadopago.com.ar/developers/panel).

---

## Instalación y Ejecución

### Prerequisitos

- Node.js 18+
- Cuenta en [Cloudinary](https://cloudinary.com/)
- Cuenta en Gmail con contraseña de aplicación habilitada
- Cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers) con una aplicación creada
- [ngrok](https://ngrok.com/) instalado y autenticado (ver [sección de pagos](#pagos-con-mercado-pago--ngrok))
- [Ollama](https://ollama.com/) instalado con el modelo `qwen3:4b` descargado (ver [sección del asistente](#asistente-virtual-n8n--ollama))
- [N8N](https://n8n.io/) corriendo localmente con el workflow importado (ver [sección del asistente](#asistente-virtual-n8n--ollama))

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/zyperr/AirMobile-integrador.git
cd AirMobile-integrador

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env en la raíz con las variables indicadas arriba

# 4. Correr el seed (crea las tablas + admin + 8 productos de prueba)
npm run dev:seed

# 5. Ejecutar el backend (en una terminal)
npm run dev:backend

# 6. Ejecutar el frontend (en otra terminal)
npm run dev:frontend

# 7. Exponer el backend con ngrok para recibir webhooks de Mercado Pago (en otra terminal)
ngrok http 3000
```

El backend corre en `http://localhost:3000` y el frontend en `http://localhost:5173`.

---

### Base de datos — desarrollo vs producción

El proyecto usa `@libsql/client` tanto para Turso en la nube como para SQLite local. El switch se hace únicamente desde el `.env`, sin tocar ningún archivo de código:

**Desarrollo local (recomendado):**
```env
TURSO_URL=file:./backend/dev.db
TURSO_TOKEN=
```
Se crea el archivo `backend/dev.db` automáticamente al correr el seed o el backend. No requiere cuenta en Turso.

**Producción (Turso):**
```env
TURSO_URL=libsql://tu-db.aws-us-east-1.turso.io
TURSO_TOKEN=tu_token_de_turso
```

> 💡 Turso permite exportar la base de datos completa desde su panel. Podés descargarla y usarla directamente como `dev.db` para tener los datos reales en local sin correr el seed.

Asegurate de que el `.gitignore` incluya:
```
backend/dev.db
backend/dev.db-shm
backend/dev.db-wal
```

---

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev:backend` | Inicia el servidor Express con hot-reload |
| `npm run dev:frontend` | Inicia el servidor de desarrollo Vite |
| `npm run dev:seed` | Crea las tablas e inserta admin + 8 productos de prueba |
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

### Pagos — `/api/pagos`

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/crear-preferencia` | ✅ Token | Crea preferencia de Checkout Pro en Mercado Pago → devuelve `init_point` |
| `POST` | `/webhook` | No | Recibe notificaciones de pago de Mercado Pago (llamado por MP, no por el frontend) |

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
- **Pago con Mercado Pago** (Checkout Pro): el usuario es redirigido al portal de pago y vuelve a la app al finalizar
- **Confirmación de compra por email** automática al aprobarse el pago
- **Historial de facturas** con fechas formateadas y descarga en PDF
- **Perfil de usuario** editable (nombre y contraseña)

### Para administradores

- **Panel de gestión** de productos (alta, baja, modificación)
- **Carga masiva** de productos desde archivos CSV o Excel
- **Gestión de facturas** con posibilidad de cambiar el estado
- **Gestión de staff**: registrar, editar, dar de baja y restaurar administradores
- **Blanqueo de contraseñas** de otros admins

---

## Pagos con Mercado Pago + ngrok

El sistema de pagos usa **Mercado Pago Checkout Pro**. El flujo completo requiere que el backend sea accesible públicamente para recibir las notificaciones (webhooks) de Mercado Pago. En desarrollo local, esto se logra con **ngrok**.

### ¿Cómo funciona?

```
Frontend                Backend (Express)              Mercado Pago
    │                         │                               │
    │ POST /crear-preferencia  │                               │
    │─────────────────────────►│                               │
    │                         │── Preference.create() ────────►│
    │                         │◄──── { init_point } ───────────│
    │◄── { init_point } ──────│                               │
    │                         │                               │
    │ Redirige al init_point   │                               │
    │──────────────────────────────────────────────────────────►│
    │                         │                               │
    │ Usuario paga en MP       │                               │
    │                         │◄── POST /webhook ─────────────│
    │                         │    (ngrok lo recibe y reenvía) │
    │                         │                               │
    │                         │ Crea factura + detalles        │
    │                         │ Vacía carrito                  │
    │                         │ Envía email de confirmación    │
    │                         │                               │
    │◄── Redirige a /pago-exitoso ──────────────────────────────│
```

### Instalación de ngrok

1. Descargá ngrok desde [https://ngrok.com/download](https://ngrok.com/download) o instalalo con npm:

```bash
npm install -g ngrok
```

2. Registrate en [https://dashboard.ngrok.com](https://dashboard.ngrok.com) y copiá tu authtoken.

3. Autenticá ngrok con tu token:

```bash
ngrok config add-authtoken <TU_AUTHTOKEN>
```

### Uso en desarrollo

Con el backend corriendo en el puerto 3000, en una terminal separada ejecutá:

```bash
ngrok http 3000
```

Ngrok te dará una URL pública del estilo:

```
https://xxxx-xxxx-xxxx.ngrok-free.app
```

### Configurar la URL del webhook

Una vez que tenés la URL de ngrok, actualizá la `notification_url` en `controllerPago.js`:

```js
notification_url: "https://TU-URL.ngrok-free.app/api/pagos/webhook",
```

> ⚠️ **Importante:** La URL de ngrok cambia cada vez que reiniciás el proceso (en el plan gratuito). Recordá actualizarla en el controller cada vez que levantes ngrok de nuevo. En producción, reemplazá esta URL por la URL real del servidor desplegado.

### Prevención de pagos duplicados

El campo `mp_payment_id` en la tabla `facturas` tiene restricción `UNIQUE`. Si Mercado Pago envía el mismo webhook dos veces, la segunda inserción lanzará un error `SQLITE_CONSTRAINT` que se captura silenciosamente y se ignora, garantizando idempotencia.

### Estados de pago mapeados

| Estado Mercado Pago | Estado interno |
|---|---|
| `approved` | `Completado` |
| `pending` | `Pendiente` |
| `in_process` | `Pendiente` |
| `rejected` | `Cancelado` |
| `cancelled` | `Cancelado` |
| `refunded` | `Reembolsado` |

---

## Asistente Virtual (N8N + Ollama)

El proyecto incluye un chatbot flotante en toda la aplicación que conecta con un workflow de **N8N** orquestado localmente. El modelo de lenguaje que alimenta el asistente es **qwen3:4b**, servido a través de **Ollama**.

El asistente está configurado como vendedor especializado de AirMobile con dos herramientas conectadas a la base de datos real:

- **Buscar Producto** — Se activa cuando el usuario menciona una categoría, modelo específico, o hace una consulta con perfil o presupuesto definido.
- **Consultar Catálogo General** — Se activa ante consultas genéricas sin categoría ni perfil. Trae hasta 12 productos agrupados por categoría.

### Configuración del modelo

El workflow usa `qwen3:4b` con las siguientes opciones:

| Parámetro | Valor | Motivo |
|---|---|---|
| `temperature` | `0.3` | Respuestas más deterministas y precisas |
| `numCtx` | `4096` | Contexto suficiente para procesar el JSON de productos sin truncar |

El system prompt incluye `/no_think` como primera línea para desactivar el modo de razonamiento interno de qwen3 y reducir la latencia de respuesta.

Las variables de entorno necesarias para el chat son:
- `VITE_N8N_WEBHOOK_URL` — URL del webhook activo de N8N
- `VITE_TEST_N8N` — URL del webhook de prueba de N8N

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

### 2. Descargar el modelo qwen3:4b

```bash
ollama pull qwen3:4b
```

> La descarga pesa aproximadamente **2.6 GB**.

Para verificar que el modelo está disponible:
```bash
ollama list
```

Para verificar que está corriendo en GPU:
```bash
ollama ps
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

### 4. Importar el workflow

El archivo `ecommerce-chatbot-v4.json` en la raíz del proyecto contiene el workflow listo para usar.

1. Abrí N8N en `http://localhost:5678`
2. Ir a **Settings → Import workflow** y seleccioná el archivo `ecommerce-chatbot-v4.json`
3. Configurá las credenciales del nodo **Ollama Chat Model** apuntando a `http://localhost:11434`
4. Copiá las URLs del webhook y pegálas en el `.env`:
   ```env
   VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/tu-id-de-webhook
   VITE_TEST_N8N=http://localhost:5678/webhook-test/tu-id-de-webhook
   ```
5. Activá el workflow con el switch **Active** en la esquina superior derecha