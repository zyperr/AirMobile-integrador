# AirMobile — Documentación Técnica

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Base de Datos](#2-base-de-datos)
   - [Esquema de Tablas](#esquema-de-tablas)
   - [Relaciones](#relaciones)
   - [Notas de Diseño](#notas-de-diseño)
3. [Backend](#3-backend)
   - [Estructura de Capas](#estructura-de-capas)
   - [Middlewares](#middlewares)
   - [Modelos](#modelos)
   - [Controllers](#controllers)
   - [Schemas de Validación](#schemas-de-validación)
   - [Utilidades](#utilidades)
   - [Constantes del Sistema](#constantes-del-sistema)
4. [Frontend](#4-frontend)
   - [Páginas](#páginas)
   - [Contextos Globales](#contextos-globales)
   - [Hooks Personalizados](#hooks-personalizados)
5. [Flujos Funcionales](#5-flujos-funcionales)
   - [Autenticación y Refresh Token](#autenticación-y-refresh-token)
   - [Ciclo de Compra con Mercado Pago](#ciclo-de-compra-con-mercado-pago)
   - [Webhook de Mercado Pago](#webhook-de-mercado-pago)
6. [Seguridad](#6-seguridad)
7. [Asistente Virtual — N8N + Ollama](#7-asistente-virtual--n8n--ollama)
   - [Arquitectura del workflow](#arquitectura-del-workflow)
   - [Modelo y parámetros](#modelo-y-parámetros)
   - [Tools disponibles](#tools-disponibles)
   - [Decisiones técnicas y problemas resueltos](#decisiones-técnicas-y-problemas-resueltos)
8. [Base de datos local vs Turso](#8-base-de-datos-local-vs-turso)
9. [Seed de desarrollo](#9-seed-de-desarrollo)
10. [Infraestructura Local con ngrok](#10-infraestructura-local-con-ngrok)

---

## 1. Arquitectura General

AirMobile sigue una arquitectura **cliente-servidor desacoplada** dentro de un único repositorio monorepo.

```
Cliente (React + Vite)          Servidor (Express)           Servicios externos
        │                               │
        │  HTTP / REST API              │──── Turso (LibSQL) / SQLite local   BD
        │ ─────────────────────────►   │──── Cloudinary                      Imágenes
        │ ◄─────────────────────────   │──── Gmail (Nodemailer)              Emails
        │                               │──── Mercado Pago SDK               Pagos
        │  Webhook (N8N)                │
        │ ─────────────────────────►  N8N ── Ollama (qwen3:4b)              IA chatbot
        │
        │  ngrok (solo desarrollo)
        Mercado Pago ──────────────► ngrok ──► Express /api/pagos/webhook
```

- **Frontend:** SPA construida con React 19 y Vite. Se comunica con el backend exclusivamente mediante `fetch` a través del hook `useApi`, que incluye un interceptor automático de renovación de sesión.
- **Backend:** API REST construida con Express 5, organizada en capas (routes → middlewares → controllers → models).
- **Base de datos:** `@libsql/client` soporta tanto Turso en la nube como SQLite local. El switch se hace únicamente desde `TURSO_URL` en el `.env`, sin tocar código.
- **Imágenes:** Las imágenes de productos se almacenan en Cloudinary. Solo las URLs resultantes se guardan en la base de datos.
- **Emails:** Nodemailer conectado a Gmail vía contraseña de aplicación.
- **Pagos:** Mercado Pago SDK (Checkout Pro). En desarrollo, ngrok expone el servidor local para que Mercado Pago pueda enviar webhooks.
- **Chatbot:** Un webhook de N8N actúa de intermediario entre el frontend y el modelo `qwen3:4b` que corre localmente vía Ollama.

---

## 2. Base de Datos

### Esquema de Tablas

#### `usuarios`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `nombre` | TEXT | NOT NULL | Nombre del usuario |
| `email` | TEXT | NOT NULL, UNIQUE | Correo electrónico |
| `password` | TEXT | NOT NULL | Hash bcrypt de la contraseña |
| `rol` | TEXT | DEFAULT `'cliente'` | `'cliente'` o `'admin'` |
| `verificado` | TEXT | DEFAULT `'falso'` | `'falso'` o `'verdadero'` tras verificar |
| `codigo_verificacion` | TEXT | — | Código de 6 dígitos temporal |
| `activo` | INTEGER | DEFAULT `1` | Borrado lógico: `0` = dado de baja |

---

#### `productos`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `nombre_producto` | TEXT | NOT NULL | Nombre del producto |
| `precio` | REAL | NOT NULL, CHECK > 0 | Precio |
| `capacidad` | TEXT | — | Array serializado como JSON (ej: `["128GB","256GB"]`) |
| `descripcion` | TEXT | — | Descripción libre |
| `imagen_url` | TEXT | — | Array de URLs serializado como JSON |
| `categoria` | TEXT | NOT NULL | Ver [categorías válidas](#categorías-válidas) |
| `condicion` | TEXT | NOT NULL, CHECK | `'nuevo'`, `'reacondicionado'` o `'usado'` |
| `activo` | INTEGER | DEFAULT `1` | Borrado lógico |
| `fecha_creacion` | — | DEFAULT CURRENT_TIMESTAMP | Fecha de alta |
| `bateria` | INTEGER | DEFAULT NULL | Porcentaje de batería (solo celulares y tablets) |

> **Columnas JSON:** `capacidad` e `imagen_url` se almacenan como strings JSON. El controller serializa con `JSON.stringify()` al escribir y deserializa con `JSON.parse()` al leer.

---

#### `carrito`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `usuario_id` | INTEGER | FK → usuarios.id, ON DELETE CASCADE | Propietario del carrito |
| `producto_id` | INTEGER | FK → productos.id, ON DELETE CASCADE | Producto en el carrito |
| `cantidad` | INTEGER | DEFAULT `1` | Unidades del producto |

> Si se agrega un producto que ya existe en el carrito del mismo usuario, el modelo incrementa la `cantidad` existente (upsert).

---

#### `facturas`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `usuario_id` | INTEGER | FK → usuarios.id, ON DELETE SET NULL | Usuario comprador |
| `total` | REAL | NOT NULL | Total de la compra |
| `fecha` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de emisión |
| `estado` | TEXT | DEFAULT `'Pendiente'` | Ver [estados de factura](#estados-de-factura) |
| **`mp_payment_id`** | **TEXT** | **UNIQUE** | **ID del pago en Mercado Pago. Garantiza idempotencia del webhook** |

---

#### `detalles_factura`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `factura_id` | INTEGER | FK → facturas.id, ON DELETE CASCADE | Factura a la que pertenece |
| `producto_id` | INTEGER | FK → productos.id | Producto comprado |
| `cantidad` | INTEGER | NOT NULL | Unidades compradas |
| `precio_unitario` | REAL | NOT NULL | Precio al momento de la compra (snapshot) |

> `precio_unitario` guarda el precio en el momento de la compra. Si el precio cambia en el futuro, la factura histórica conserva el valor correcto.

---

#### `lista_deseados`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `usuario_id` | INTEGER | FK → usuarios.id, ON DELETE CASCADE | Usuario dueño de la lista |
| `producto_id` | INTEGER | FK → productos.id, ON DELETE CASCADE | Producto deseado |
| — | — | UNIQUE(usuario_id, producto_id) | Evita duplicados |

---

#### `refresh_tokens`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `usuario_id` | INTEGER | FK → usuarios.id, ON DELETE CASCADE | Propietario del token |
| `refresh_token` | TEXT | NOT NULL, UNIQUE | Token opaco de 80 caracteres hexadecimales |
| `fecha_expiracion` | DATETIME | NOT NULL | Vigencia de 7 días desde la creación |
| `revocado` | BOOLEAN | DEFAULT `0` | `1` = token quemado (soft delete) |
| `fecha_creacion` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de emisión |

> Se crea un índice en `refresh_token` (`idx_refresh_token`) para optimizar las búsquedas por token en cada renovación de sesión.

---

### Relaciones

```
usuarios ──────────────────────┬───────────────────────┐
    │ 1                         │ 1                      │ 1
    │ N                         │ N                      │ N
  carrito                  facturas ──── N ──── detalles_factura   refresh_tokens
    │ N                         │ N                    │ N
    │ 1                                                │ 1
  productos ◄──────────────────────────────────────── ┘
    │ 1
    │ N
  lista_deseados
    │ N
    │ 1
  usuarios
```

---

### Notas de Diseño

- **Borrado lógico:** Productos y staff nunca se eliminan físicamente. Se marca `activo = 0`. Todas las queries filtran por `activo = 1`.
- **Eliminación en cascada:** Si se elimina un usuario, su carrito, lista de deseados y refresh tokens se eliminan automáticamente (`ON DELETE CASCADE`). Las facturas quedan con `usuario_id = NULL` (`ON DELETE SET NULL`).
- **Paginación:** Los endpoints de listado aceptan `page` y `limit` como query params. El modelo ejecuta dos queries en paralelo con `Promise.all`: una con `LIMIT / OFFSET` y otra con `COUNT(*)`.
- **Refresh token opaco:** A diferencia del access token (JWT firmado y auto-verificable), el refresh token es un string hexadecimal aleatorio que solo puede validarse consultando la base de datos. Esto permite revocarlo en cualquier momento.
- **Idempotencia de pagos:** La columna `mp_payment_id` en `facturas` tiene restricción `UNIQUE`. Si el webhook de Mercado Pago llega duplicado, el segundo intento de INSERT falla con `SQLITE_CONSTRAINT`, que se captura y se ignora en el controller.

---

## 3. Backend

### Estructura de Capas

```
Request HTTP
    │
    ▼
[ Router ]          → Define el path y el método HTTP
    │
    ▼
[ Middleware ]      → verificarToken → verificarAdmin (si aplica)
    │
    ▼
[ Controller ]      → Valida con Joi, orquesta la lógica, llama al Model
    │
    ▼
[ Model ]           → Ejecuta la query SQL contra la BD
    │
    ▼
[ Response JSON ]
```

---

### Middlewares

#### `verificarToken`

**Archivo:** `backend/src/middlewares/authMiddleware.js`

Extrae el token del header `Authorization: Bearer <token>`, lo verifica con `jwt.verify()` usando la `SECRET_KEY` y adjunta el payload en `req.user`. Responde `401` cuando el token es inválido o expiró.

Payload en `req.user`:
```json
{
  "id": 1,
  "rol": "cliente",
  "email": "usuario@gmail.com",
  "nombre": "Juan"
}
```

Los access tokens tienen expiración de **15 minutos**.

---

#### `verificarAdmin`

**Archivo:** `backend/src/middlewares/verificarAdmin.js`

Debe ejecutarse siempre después de `verificarToken`. Comprueba que `req.user.rol === 'admin'`. Si no es admin, responde con `403`.

---

#### `uploadImg` / `uploadMiddleware`

Multer configurado en memoria. Filtra por MIME type (solo imágenes). Ver `multer.js` y `fileFilter.js`.

---

### Modelos

#### `ModelFactura`

| Método | Descripción |
|---|---|
| `createFactura({ usuario_id, total, mp_payment_id, estado })` | Inserta una factura con el ID de pago de Mercado Pago |
| `getFacturaById(id)` | Obtiene una factura por ID |
| `getAllFacturas()` | Obtiene todas las facturas (solo admin) |
| `getFacturasByUsuario(usuarioId)` | Facturas del usuario con campo `fecha_formateada` (zona `America/Argentina/Buenos_Aires`) |
| `updateEstadoFactura(id, estado)` | Actualiza el estado de una factura |

---

#### `ModelDetalleFactura`

**Archivo:** `backend/src/models/modelDetalleFactura.js`

| Método | Descripción |
|---|---|
| `createDetalleFactura(facturaId, productoId, cantidad, precioUnitario)` | Inserta una línea de detalle |
| `getDetallesFacturaByFacturaId(facturaId)` | JOIN entre `detalles_factura`, `productos` y `facturas` |

---

#### `TokenModel`

**Archivo:** `backend/src/models/modelToken.js`

| Método | Descripción |
|---|---|
| `guardarRefreshToken(refreshToken, idUsuario, fechaExpiracionStr)` | Inserta un nuevo refresh token activo |
| `buscarRefreshToken(refreshToken)` | Busca el token por su valor |
| `revocarRefreshToken(refreshToken)` | Soft delete: setea `revocado = 1` |
| `revocarTokenEspecifico(refreshToken)` | Ídem con valor string `'1'` (compatibilidad Turso BOOLEAN) |

---

### Controllers

#### `controllerPago`

##### `crearPreferencia` — `POST /api/pagos/crear-preferencia`

```
1. Obtiene el usuario autenticado (req.user.id)
2. Lee el carrito del usuario → 400 si está vacío
3. Mapea los items al formato de Mercado Pago:
   { title, unit_price, quantity, currency_id: "ARS" }
4. Llama a Preference.create() con:
   - items, external_reference: userId
   - notification_url: URL pública de ngrok + /api/pagos/webhook
   - back_urls: rutas del frontend para éxito, fallo y pendiente
   - auto_return: "all"
5. Responde con { exito: true, init_point }
```

---

##### `recibirWebhook` — `POST /api/pagos/webhook` (sin autenticación)

```
1. Extrae paymentId y topic del query string o body
2. Si topic === 'payment':
   a. Consulta Payment.get({ id: paymentId }) a la API de MP
   b. Si estado IN ['approved', 'pending', 'in_process']:
      - ModelFactura.createFactura({ usuario_id, total, mp_payment_id, estado })
        → SQLITE_CONSTRAINT (duplicado): ignora silenciosamente
      - ModelDetalleFactura.createDetalleFactura() por cada item
      - ModelCarrito.emptyCarrito(userId)
      - enviarEmailCompra()
3. Responde siempre 200 OK
```

**Mapeo de estados:**

| MP | Interno |
|---|---|
| `approved` | `Completado` |
| `pending` | `Pendiente` |
| `in_process` | `Pendiente` |
| `rejected` | `Cancelado` |
| `cancelled` | `Cancelado` |
| `refunded` | `Reembolsado` |

---

#### `controlerUsuario`

##### `login`

1. Genera refresh token opaco: `crypto.randomBytes(40).toString('hex')` (80 chars hex)
2. Calcula expiración a 7 días
3. Valida con `insertarTokenSchema` (Joi)
4. Llama a `TokenModel.guardarRefreshToken()`
5. Devuelve `{ token (15min), refreshToken (7 días), data }`

##### `renovarSesion` — `POST /api/usuarios/refresh`

```
1. Valida body con renovarTokenRequestSchema
2. Busca token en BD → 401 si no existe
3. Verifica que no esté revocado → 401
4. Verifica que no haya expirado → 401
5. Genera nuevo access token (15 min)
6. Revoca el refresh token entrante
7. Genera y guarda nuevo refresh token (7 días)
8. Responde con { token, refreshToken }
```

##### `cerrarSesion` — `POST /api/usuarios/logout`

Recibe `refreshToken` en el body y llama a `TokenModel.revocarTokenEspecifico()`.

---

#### `controllerFactura`

- `obtenerFacturasDeUsuario`: formatea fechas a zona horaria `America/Argentina/Buenos_Aires` añadiendo `fecha_formateada` a cada factura.
- `actualizarEstadoFactura`: valida que el estado sea uno de los valores del objeto `ESTADOS`.

---

### Schemas de Validación

| Schema | Campos clave |
|---|---|
| `schemaRefreshToken.js` → `insertarTokenSchema` | `idUsuario` (int), `refreshToken` (min 20), `fechaExpiracionStr` (ISO 8601) |
| `schemaRefreshToken.js` → `renovarTokenRequestSchema` | `refreshToken` (string requerido) |
| `schemaVerificacion.js` | `codigo` (exactamente 6 chars) |
| `schemaResetPassword.js` | `email`, `codigo` (6 chars), `nuevaPassword` (6-30 chars) |
| `schemaStaff.js` → `schemaRegistroStaff` | `nombre` (3-50), `email`, `password` (mín 8) |
| `schemaUpdateUsuario.js` → `schemaActualizarPassword` | `password` (8-30 chars) |
| `schemaUpdateUsuario.js` → `schemaActualizarNombre` | `nombre` (2-50 chars, `.trim()`) |
| `schemaUpdateProducto.js` | Todos los campos opcionales, `.min(1)` obligatorio |
| `schemaQueriesFiltros.js` | `categoria`, `precioMin/Max`, `busqueda`, `condicion`, `page`, `limit`, `orden`, `bateriaMin`, `capacidad` |

---

### Utilidades

#### `mailer.js`

Incluye `enviarEmailCompra()`, llamada desde el webhook de Mercado Pago al procesar un pago exitoso. Recibe: `email`, `nombreUsuario`, `items`, `total`, `mp_payment_id`, `facturaId` y `fecha`.

---

### Constantes del Sistema

#### Categorías válidas

```
celulares | tablets | relojes | auriculares | cargadores | cables | powerbanks | fundas | protectores | accesorios
```

#### Estados de factura

```
Pendiente | Completado | Enviado | Cancelado | Reembolsado
```

---

## 4. Frontend

### Páginas

| Página | Ruta | Descripción |
|---|---|---|
| `PagoExitoso` | `/pago-exitoso` | Destino tras un pago aprobado |
| `PagoFallido` | `/pago-fallido` | Destino tras un pago rechazado |
| `PagoPendiente` | `/pago-pendiente` | Destino tras un pago pendiente |

Estas rutas se configuran como `back_urls` en la preferencia de Mercado Pago.

---

### Contextos Globales

#### `AuthContext`

**Archivo:** `frontend/src/context/AuthContext.jsx`

| Valor expuesto | Tipo | Descripción |
|---|---|---|
| `token` | string \| null | Access JWT en `localStorage` |
| `refreshToken` | string \| null | Refresh token en `localStorage` |
| `estaAutenticado` | boolean | `true` si hay access token |
| `usuario` | object \| null | Datos del perfil (`id`, `nombre`, `email`, `rol`) |
| `setUsuario` | función | Actualiza el objeto usuario (usado por `useApi` tras renovar sesión) |
| `login(token, refreshToken)` | función | Guarda ambos tokens en estado y `localStorage` |
| `logout()` | función | Revoca el refresh token en el backend, limpia estado y redirige a `/` |

**Comportamiento del `logout`:** intenta llamar a `POST /api/usuarios/logout` para revocar el token en el servidor. Si el servidor no responde, igual limpia el estado local (fail-safe).

**Carga del perfil:** un `useEffect` observa el `token` y llama automáticamente a `GET /api/usuarios/mi-perfil` para hidratar el objeto `usuario`.

---

### Hooks Personalizados

#### `useApi`

**Archivo:** `frontend/src/hooks/useApi.js`

Incluye un **interceptor automático de renovación de sesión**. Cuando cualquier petición recibe un `401`, intenta renovar los tokens antes de reintentar de forma transparente.

**Variable global `promesaRenovacion`:** actúa como semáforo. Si múltiples peticiones fallan con `401` al mismo tiempo, solo la primera llama a `/refresh`; las demás esperan la misma promesa.

```
Petición recibe 401 y hay refreshToken
    │
    ├─ promesaRenovacion === null → POST /api/usuarios/refresh
    └─ promesaRenovacion !== null → espera la promesa existente
    │
    ▼
Éxito → login(token, refreshToken), reintenta la petición original
Fallo → logout() → redirige al login
```

---

## 5. Flujos Funcionales

### Autenticación y Refresh Token

#### Login

```
POST /api/usuarios/login
    │  bcrypt.compare(password, hash)
    │  refreshToken = crypto.randomBytes(40).hex()
    │  TokenModel.guardarRefreshToken()
    │  jwt.sign({ id, rol, email, nombre }, SECRET_KEY, { expiresIn: '15m' })
    ▼
{ token (15min), refreshToken (7 días), data }
    │
    ▼
AuthContext.login() → guarda en estado + localStorage
```

#### Cierre de sesión

```
AuthContext.logout()
    │
    ▼
POST /api/usuarios/logout { refreshToken }
    │  TokenModel.revocarTokenEspecifico() → revocado = '1'
    ▼
localStorage limpio → redirect "/"
```

---

### Ciclo de Compra con Mercado Pago

```
1. POST /api/carrito/agregar-carrito/:id
2. GET /api/carrito/
3. POST /api/pagos/crear-preferencia → { init_point }
4. Frontend redirige a init_point
5. Usuario paga en Mercado Pago
6. MP llama a POST /api/pagos/webhook (vía ngrok en desarrollo)
7. MP redirige al usuario:
   - Éxito  → /pago-exitoso
   - Fallo  → /pago-fallido
   - Pendiente → /pago-pendiente
```

---

### Webhook de Mercado Pago

```
POST https://<ngrok-url>/api/pagos/webhook
    │
    ├─ topic !== 'payment' → 200, termina
    │
    ▼
Payment.get({ id: paymentId })
    │
    ├─ estado fuera de rango → 200, termina
    │
    ▼
try {
  ModelFactura.createFactura({ mp_payment_id: paymentId, ... })  ← UNIQUE
  ModelDetalleFactura.createDetalleFactura() × items
  ModelCarrito.emptyCarrito(userId)
  enviarEmailCompra()
} catch (e) {
  SQLITE_CONSTRAINT → pago duplicado, ignorar
  otro error → log crítico
}
    │
    ▼
Responde 200 OK (siempre)
```

---

## 6. Seguridad

| Aspecto | Implementación |
|---|---|
| **Contraseñas** | Hash con `bcrypt`, salt 10 |
| **Access token** | JWT firmado con `SECRET_KEY`, expiración 15 minutos |
| **Refresh token** | String opaco 80 chars hex, nunca un JWT |
| **Rotación de tokens** | Cada uso del refresh token lo invalida y genera uno nuevo |
| **Revocación explícita** | El logout revoca el refresh token en la BD (`revocado = 1`) |
| **Semáforo anti-race** | `promesaRenovacion` en `useApi` evita múltiples renovaciones simultáneas |
| **Validación Joi** | El refresh token se valida con `insertarTokenSchema` antes de insertarse |
| **Autorización** | Doble middleware: `verificarToken` + `verificarAdmin` |
| **SQL Injection** | Todas las queries usan parámetros preparados (`args: [...]`) |
| **CORS** | Solo acepta `localhost:5173` y el dominio de producción |
| **Subida de archivos** | Multer filtra por MIME type, almacenamiento en memoria |
| **Variables de entorno** | Todas las credenciales en `.env` vía `dotenv` |
| **Idempotencia de pagos** | `mp_payment_id` UNIQUE en `facturas` previene facturas duplicadas |
| **Webhook sin JWT** | Valida el payload consultando directamente la API de MP con el `paymentId` |

---

## 7. Asistente Virtual — N8N + Ollama

### Arquitectura del workflow

```
Webhook (POST)
    │
    ▼
Preparar Contexto (Set)
    │  Inyecta nombre del cliente en el mensaje
    ▼
AI Agent (qwen3:4b vía Ollama)
    ├── Simple Memory (contextWindowLength: 5)
    ├── Tool: Buscar Producto      → GET /api/productos/productos?busqueda=&categoria=
    └── Tool: Consultar Catálogo   → GET /api/productos/productos?limit=12&page=1
    │
    ▼
Respond to Webhook
```

---

### Modelo y parámetros

| Parámetro | Valor | Motivo |
|---|---|---|
| Modelo | `qwen3:4b` | Soporta tool calling, menor latencia que 8b, corre bien en GPU |
| `temperature` | `0.3` | Respuestas deterministas y precisas para un contexto de ventas |
| `numCtx` | `4096` | Contexto suficiente para procesar el JSON de productos sin truncar la respuesta |
| `contextWindowLength` | `5` | Historial de 5 turnos; suficiente continuidad sin sobrecargar el contexto |

> **Por qué `qwen3:4b` y no `qwen3:8b`:** con `numCtx: 2048`, el modelo 8b dejaba el `output` vacío porque no tenía espacio para completar la respuesta después del bloque thinking. Con `qwen3:4b` y `numCtx: 4096` este problema desaparece y la latencia mejora.

> **Por qué no `gemma3:4b`:** gemma3 no soporta tool calling en Ollama, lo que rompe el mecanismo de selección de herramientas del agente de N8N.

El system prompt incluye `/no_think` como primera línea para desactivar el modo de razonamiento interno de qwen3 y reducir la latencia.

---

### Tools disponibles

#### Buscar Producto

**URL:** `GET /api/productos/productos?busqueda={busqueda}&categoria={categoria}`

Se activa cuando el usuario menciona un producto, categoría o modelo específico, **o** cuando hace una consulta con perfil o presupuesto definido (ej: *"un iPhone para mi mamá"*, *"tengo $500"*). El agente extrae los parámetros `busqueda` y `categoria` del mensaje con `$fromAI()`.

#### Consultar Catálogo General

**URL:** `GET /api/productos/productos?limit=12&page=1`

Se activa únicamente ante consultas genéricas sin categoría ni perfil (ej: *"qué tienen"*, *"mostrame todo"*). Limitado a 12 productos para reducir el volumen de tokens que el modelo debe procesar.

---

### Decisiones técnicas y problemas resueltos

| Problema | Causa | Solución aplicada |
|---|---|---|
| `{"output":""}` en respuestas | `numCtx` demasiado chico; el modelo no tenía espacio para responder tras el thinking | `numCtx: 2048` → `4096` |
| Respuestas en inglés analizando JSON | El modelo interpretaba el JSON de la tool como tarea de análisis | Directiva explícita en system prompt y tool descriptions: *"La respuesta es un JSON. Usalo ÚNICAMENTE para redactar tu respuesta en español"* |
| No usaba la tool en consultas complejas | La toolDescription solo cubría menciones explícitas de categoría | Se agregaron ejemplos de recomendaciones con perfil y la regla de inferir `categoria=celulares` cuando el contexto lo implica |
| Alta latencia en catálogo | `limit=50` → el modelo procesaba cientos de tokens de productos | `limit=50` → `limit=12` |
| Respuestas inconsistentes con `gemma3:4b` | gemma3 no soporta tool calling en Ollama | Se descartó; se usa `qwen3:4b` |

---

## 8. Base de datos local vs Turso

`conexion.js` lee `TURSO_URL` del `.env`. `@libsql/client` detecta automáticamente si es una URL remota (`libsql://...`) o un archivo local (`file:...`) y se comporta de forma idéntica en ambos casos. No requiere ningún cambio en el resto del código.

```js
// conexion.js
export async function obtenerDb() {
    const turso = createClient({
        url: process.env.TURSO_URL,
        authToken: process.env.TURSO_TOKEN,
    });
    return turso;
}
```

**Desarrollo:**
```env
TURSO_URL=file:./backend/dev.db
TURSO_TOKEN=
```

**Producción:**
```env
TURSO_URL=libsql://tu-db.aws-us-east-1.turso.io
TURSO_TOKEN=tu_token
```

El archivo `dev.db` se genera automáticamente al correr el seed o levantar el backend. Turso permite exportar la base de datos completa desde su panel, por lo que se puede descargar y usarla directamente como `dev.db` para tener datos reales en local.

Archivos que deben estar en `.gitignore`:
```
backend/dev.db
backend/dev.db-shm
backend/dev.db-wal
```

Los archivos `.db-shm` y `.db-wal` son auxiliares del modo WAL (Write-Ahead Logging) de SQLite y se gestionan automáticamente.

---

## 9. Seed de desarrollo

**Archivo:** `backend/src/seed.js`
**Comando:** `npm run dev:seed`

Crea las tablas (llamando a `inicializarBaseDeDatos()`) e inserta datos de prueba de forma idempotente — si el admin o algún producto ya existe, lo saltea sin error.

**Contenido:**

- 1 usuario admin (`admin@airmobile.com` con la `ADMIN_PASSWORD` del `.env`)
- 8 productos de prueba cubriendo las categorías principales: celulares (iPhone 15 Pro Max, iPhone 13, iPhone 11), tablets (iPad Air 5ta Gen), relojes (Apple Watch Series 9), auriculares (AirPods Pro 2da Gen), fundas (Funda Silicona iPhone 15 Pro) y accesorios (AirTag pack x4)

**Guard clauses aplicadas:**
- Si `ADMIN_PASSWORD` no está definida en el `.env` → corta con `process.exit(1)`
- Si el admin ya existe → lo saltea
- Si un producto ya existe → lo saltea

---

## 10. Infraestructura Local con ngrok

Mercado Pago necesita una URL pública para enviar webhooks. En desarrollo, ngrok crea un túnel HTTPS hacia `localhost:3000`.

```
Mercado Pago
    │  POST https://xxxx.ngrok-free.app/api/pagos/webhook
    ▼
ngrok (proceso local)
    │  Reenvía a localhost:3000
    ▼
Express /api/pagos/webhook
```

### Configuración

```bash
# 1. Instalar
npm install -g ngrok

# 2. Autenticar
ngrok config add-authtoken <TOKEN>

# 3. Levantar el túnel (con el backend corriendo)
ngrok http 3000
```

Copiar la URL generada y actualizar `controllerPago.js`:

```js
notification_url: "https://abc123.ngrok-free.app/api/pagos/webhook",
```

### Consideraciones

- **Plan gratuito:** la URL cambia cada vez que se reinicia ngrok; hay que actualizarla en el controller.
- **Plan pago:** permite reservar un subdominio fijo.
- **Producción:** reemplazar por la URL real del servidor; ngrok no es necesario.
- **Panel de inspección:** `http://localhost:4040` muestra todas las requests recibidas, útil para depurar webhooks.