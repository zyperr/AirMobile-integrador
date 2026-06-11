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
   - [Componentes](#componentes)
   - [Contextos Globales](#contextos-globales)
   - [Hooks Personalizados](#hooks-personalizados)
5. [Flujos Funcionales](#5-flujos-funcionales)
   - [Registro y Verificación de Cuenta](#registro-y-verificación-de-cuenta)
   - [Autenticación y Refresh Token](#autenticación-y-refresh-token)
   - [Ciclo de Compra con Mercado Pago](#ciclo-de-compra-con-mercado-pago)
   - [Webhook de Mercado Pago](#webhook-de-mercado-pago)
   - [Carga Masiva de Productos](#carga-masiva-de-productos)
   - [Recuperación de Contraseña](#recuperación-de-contraseña)
6. [Seguridad](#6-seguridad)
7. [Asistente Virtual](#7-asistente-virtual)
8. [Infraestructura Local con ngrok](#8-infraestructura-local-con-ngrok)

---

## 1. Arquitectura General

AirMobile sigue una arquitectura **cliente-servidor desacoplada** dentro de un único repositorio monorepo.

```
Cliente (React + Vite)          Servidor (Express)           Servicios externos
        │                               │
        │  HTTP / REST API              │
        │ ─────────────────────────►   │──── Turso (LibSQL)      Base de datos
        │ ◄─────────────────────────   │──── Cloudinary          Imágenes
        │                               │──── Gmail (Nodemailer)  Emails
        │  Webhook (N8N)                │──── Mercado Pago SDK    Pagos
        │ ─────────────────────────►  N8N ── Ollama (qwen3:8b)  IA del chatbot
        │
        │  ngrok (desarrollo)
        │  Mercado Pago ────────────► ngrok ──► Express /api/pagos/webhook
```

- **Frontend:** SPA construida con React 19 y Vite. Se comunica con el backend exclusivamente mediante `fetch` a través del hook `useApi`, que incluye un interceptor automático de renovación de sesión.
- **Backend:** API REST construida con Express 5, organizada en capas (routes → middlewares → controllers → models).
- **Base de datos:** Turso, una base de datos LibSQL (SQLite compatible) serverless alojada en la nube. La conexión se establece mediante `@libsql/client`.
- **Imágenes:** Las imágenes de productos se almacenan en Cloudinary. Solo las URLs resultantes se guardan en la base de datos.
- **Emails:** Nodemailer conectado a Gmail vía contraseña de aplicación para enviar códigos de verificación, recuperación de contraseña y confirmaciones de compra.
- **Pagos:** Mercado Pago SDK (Checkout Pro). En desarrollo, ngrok expone el servidor local para que Mercado Pago pueda enviar webhooks.
- **Chatbot:** Un webhook de N8N actúa de intermediario entre el frontend y el modelo Ollama (qwen3:8b) que corre localmente.

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
| `estado` | TEXT | DEFAULT `'Completado'` | Ver [estados de factura](#estados-de-factura) |
| **`mp_payment_id`** | **TEXT** | **UNIQUE** | **ID del pago en Mercado Pago. Garantiza idempotencia del webhook** |

> `mp_payment_id` es la columna clave para la integración con Mercado Pago. Su restricción `UNIQUE` evita que el mismo pago genere dos facturas si Mercado Pago envía el webhook más de una vez.

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
    │ 1                         │                      │ 1
  productos ◄─────────────────── ┘                 productos
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

Las peticiones siguen este flujo estricto:

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
[ Model ]           → Ejecuta la query SQL contra Turso
    │
    ▼
[ Response JSON ]
```

---

### Middlewares

#### `verificarToken`

**Archivo:** `backend/src/middlewares/authMiddleware.js`

Intercepta todas las rutas protegidas. Extrae el token del header `Authorization: Bearer <token>`, lo verifica con `jwt.verify()` usando la `SECRET_KEY` del entorno y adjunta el payload decodificado en `req.user`.

> Responde `401` cuando el token es inválido o expiró, para que el interceptor del frontend pueda distinguirlo correctamente y activar el flujo de renovación.

Payload almacenado en `req.user`:
```json
{
  "id": 1,
  "rol": "cliente",
  "email": "usuario@gmail.com",
  "nombre": "Juan"
}
```

Los access tokens tienen una expiración de **15 minutos**.

---

#### `verificarAdmin`

**Archivo:** `backend/src/middlewares/verificarAdmin.js`

Debe ejecutarse siempre después de `verificarToken`. Comprueba que `req.user.rol === 'admin'`. Si no es admin, responde con `403`.

---

#### `uploadImg` / `uploadMiddleware`

Multer configurado en memoria. Filtra por MIME type (solo imágenes). Ver `multer.js` y `fileFilter.js`.

---

### Modelos

#### `ModelFactura` (actualizado)

| Método | Descripción |
|---|---|
| `createFactura({ usuario_id, total, mp_payment_id, estado })` | Inserta una factura con el ID de pago de Mercado Pago. `mp_payment_id` es obligatorio para la integración |
| `getFacturaById(id)` | Obtiene una factura por ID |
| `getAllFacturas()` | Obtiene todas las facturas (solo admin) |
| `getFacturasByUsuario(usuarioId)` | Facturas del usuario con campo `fecha_formateada` (zona `America/Argentina/Buenos_Aires`) |
| `updateEstadoFactura(id, estado)` | Actualiza el estado de una factura |

---

#### `ModelDetalleFactura`

**Archivo:** `backend/src/models/modelDetalleFactura.js`

| Método | Descripción |
|---|---|
| `createDetalleFactura(facturaId, productoId, cantidad, precioUnitario)` | Inserta una línea de detalle en `detalles_factura` |
| `getDetallesFacturaByFacturaId(facturaId)` | JOIN entre `detalles_factura`, `productos` y `facturas`. Devuelve cantidad, precio unitario, nombre e imagen del producto, fecha y usuario_id |

---

#### `TokenModel`

**Archivo:** `backend/src/models/modelToken.js`

| Método | Descripción |
|---|---|
| `guardarRefreshToken(refreshToken, idUsuario, fechaExpiracionStr)` | Inserta un nuevo refresh token activo |
| `buscarRefreshToken(refreshToken)` | Busca el token por su valor; devuelve la fila completa o `null` |
| `revocarRefreshToken(refreshToken)` | Soft delete: setea `revocado = 1` |
| `revocarTokenEspecifico(refreshToken)` | Ídem, con valor de `revocado` como string `'1'` (para compatibilidad con Turso BOOLEAN) |

---

### Controllers

#### `controllerPago`

**Archivo:** `backend/src/controllers/controllerPago.js`

Gestiona todo el ciclo de pago con Mercado Pago.

##### `crearPreferencia`

Ruta: `POST /api/pagos/crear-preferencia` — requiere autenticación.

```
1. Obtiene el usuario autenticado (req.user.id)
2. Lee el carrito del usuario → 400 si está vacío
3. Mapea los items del carrito al formato de Mercado Pago:
   { title, unit_price, quantity, currency_id: "ARS" }
4. Llama a Preference.create() con:
   - items: los productos del carrito
   - external_reference: userId (para identificar al comprador en el webhook)
   - notification_url: URL pública de ngrok + /api/pagos/webhook
   - back_urls: rutas del frontend para éxito, fallo y pendiente
   - auto_return: "all"
5. Responde con { exito: true, init_point }
```

El frontend usa el `init_point` para redirigir al usuario al portal de pago de Mercado Pago.

---

##### `recibirWebhook`

Ruta: `POST /api/pagos/webhook` — **sin autenticación** (la llama Mercado Pago directamente).

```
1. Extrae paymentId y topic del query string o body
2. Si topic === 'payment':
   a. Consulta Payment.get({ id: paymentId }) a la API de MP
   b. Si el estado es 'approved', 'pending' o 'in_process':
      - Lee external_reference (userId) y transaction_amount
      - Intenta ModelFactura.createFactura({ usuario_id, total, mp_payment_id, estado })
        → Si lanza SQLITE_CONSTRAINT (duplicado): ignora silenciosamente
        → Si lanza otro error: lo propaga
      - Por cada item del carrito: ModelDetalleFactura.createDetalleFactura()
      - ModelCarrito.emptyCarrito(userId)
      - Envía email de confirmación con enviarEmailCompra()
3. Responde siempre 200 OK (Mercado Pago reintenta si no recibe 200)
```

> **Idempotencia:** Mercado Pago puede enviar el mismo webhook varias veces. La restricción `UNIQUE` en `mp_payment_id` garantiza que solo la primera llamada crea la factura. Las subsecuentes son ignoradas.

> **Mapeo de estados:**
> | MP | Interno |
> |---|---|
> | `approved` | `Completado` |
> | `pending` | `Pendiente` |
> | `in_process` | `Pendiente` |
> | `rejected` | `Cancelado` |
> | `cancelled` | `Cancelado` |
> | `refunded` | `Reembolsado` |

---

#### `controlerUsuario` — cambios y nuevas funciones

##### `login` (actualizado)

Además de generar el JWT, ahora:
1. Genera un refresh token opaco con `crypto.randomBytes(40).toString('hex')` (80 caracteres hex).
2. Calcula la fecha de expiración a 7 días.
3. Valida ambos datos con `insertarTokenSchema` (Joi) antes de tocar la base de datos.
4. Llama a `TokenModel.guardarRefreshToken()` para persistir el token.
5. Devuelve `{ token, refreshToken, data }` en la respuesta.

El access token expira en **15 minutos**.

---

##### `renovarSesion`

Endpoint: `POST /api/usuarios/refresh`

Implementa el flujo de **rotación de refresh tokens**:

```
1. Valida el body con renovarTokenRequestSchema
2. Busca el token en la BD → 401 si no existe
3. Verifica que no esté revocado → 401 si revocado
4. Verifica que no haya expirado por fecha → 401 si expirado
5. Busca los datos del usuario por usuario_id
6. Genera un nuevo access token (15 min)
7. Revoca el refresh token entrante (revocarRefreshToken)
8. Genera y guarda un nuevo refresh token (7 días)
9. Responde con { token, refreshToken }
```

El paso 7-8 garantiza que cada refresh token solo puede usarse **una vez**.

---

##### `cerrarSesion`

Endpoint: `POST /api/usuarios/logout`

No requiere autenticación JWT. Recibe el `refreshToken` en el body y llama a `TokenModel.revocarTokenEspecifico()` para marcarlo como revocado.

---

#### `controllerFactura` (actualizado)

- `crearFactura`: usa `ModelDetalleFactura.createDetalleFactura()` (modelo separado).
- `obtenerFacturasDeUsuario`: incorpora **formateo de fechas** a zona horaria `America/Argentina/Buenos_Aires` con formato corto (`"14 may. 2026"`), añadiendo el campo `fecha_formateada` a cada factura.
- `actualizarEstadoFactura`: permite a los admins cambiar el estado. Valida que el estado sea uno de los valores del objeto `ESTADOS`.

---

### Schemas de Validación

#### `schemaRefreshToken.js`

| Schema | Uso | Campos |
|---|---|---|
| `insertarTokenSchema` | Valida datos antes de guardar en la BD | `idUsuario` (integer positivo), `refreshToken` (string min 20), `fechaExpiracionStr` (ISO 8601) |
| `renovarTokenRequestSchema` | Valida el body del endpoint `POST /refresh` | `refreshToken` (string requerido) |

#### `schemaVerificacion.js`

| Campo | Regla |
|---|---|
| `codigo` | string de exactamente 6 caracteres, requerido |

#### `schemaResetPassword.js`

| Campo | Regla |
|---|---|
| `email` | email válido, dominios `.com`, `.net`, `.ar` |
| `codigo` | string de exactamente 6 caracteres |
| `nuevaPassword` | string 6-30 caracteres |

#### `schemaStaff.js`

| Schema | Uso |
|---|---|
| `schemaRegistroStaff` | Alta de nuevo admin: `nombre` (3-50), `email`, `password` (mín 8 caracteres) |
| `schemaActualizarStaff` | Actualización parcial: `nombre` y `email` opcionales |

#### `schemaUpdateUsuario.js`

| Schema | Uso |
|---|---|
| `schemaUpdateUsuario` | Actualización de perfil: `email` requerido, `password` opcional |
| `schemaActualizarPassword` | Cambio de contraseña: `password` de 8-30 caracteres |
| `schemaActualizarNombre` | Cambio de nombre: `nombre` de 2-50 caracteres con `.trim()` |

#### `schemaUpdateProducto.js`

Schema para la actualización parcial de productos (`.min(1)` obliga a enviar al menos un campo). Todos los campos son opcionales. Reutiliza las constantes `CAPACIDADES_PERMITIDAS` y `CONDICIONES_PERMITIDAS` del schema principal de productos.

#### `schemaQueriesFiltros.js`

| Param | Tipo | Descripción |
|---|---|---|
| `categoria` | string trim, máx 50 | Filtro por categoría |
| `precioMin` / `precioMax` | number ≥ 0 | Rango de precio |
| `busqueda` | string trim, máx 100 | Búsqueda por nombre |
| `condicion` | enum CONDICIONES_PERMITIDAS | Filtro por condición |
| `page` | integer ≥ 1, default 1 | Página de resultados |
| `limit` | integer 1-100, default 10 | Resultados por página |
| `offset` | integer ≥ 0 | Desplazamiento manual (alternativo a `page`) |
| `orden` | `'asc'` o `'desc'`, default `'desc'` | Orden por fecha de creación |
| `bateriaMin` | number 70-100, múltiplo de 10 | Filtro de batería mínima |
| `capacidad` | enum CAPACIDADES_PERMITIDAS | Filtro por capacidad |

---

### Utilidades

#### `mailer.js`

Incluye `enviarEmailCompra()`, que se llama desde el webhook de Mercado Pago al procesar un pago exitoso. Recibe: `email`, `nombreUsuario`, `items`, `total`, `mp_payment_id`, `facturaId` y `fecha`. Envía un resumen de compra detallado al comprador.

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

Incluye páginas de retorno de Mercado Pago:

| Página | Ruta | Descripción |
|---|---|---|
| `PagoExitoso` | `/pago-exitoso` | Destino tras un pago aprobado |
| `PagoFallido` | `/pago-fallido` | Destino tras un pago rechazado |
| `PagoPendiente` | `/pago-pendiente` | Destino tras un pago pendiente |

Estas rutas se configuran como `back_urls` en la preferencia de Mercado Pago.

---

### Componentes

Sin cambios en los demás componentes respecto a la versión anterior.

---

### Contextos Globales

#### `AuthContext` (actualizado)

**Archivo:** `frontend/src/context/AuthContext.jsx`

| Valor expuesto | Tipo | Descripción |
|---|---|---|
| `token` | string \| null | Access JWT almacenado en `localStorage` |
| `refreshToken` | string \| null | Refresh token almacenado en `localStorage` |
| `estaAutenticado` | boolean | `true` si hay access token |
| `usuario` | object \| null | Datos del perfil (`id`, `nombre`, `email`, `rol`) |
| `setUsuario` | función | Permite actualizar el objeto usuario desde fuera (usado por `useApi` tras renovar sesión) |
| `login(token, refreshToken)` | función | Guarda ambos tokens en estado y `localStorage` |
| `logout()` | función | Revoca el refresh token en el backend, limpia estado y redirige a `/` |

**Comportamiento del `logout`:** primero intenta llamar a `POST /api/usuarios/logout` con el refresh token para revocarlo en el servidor. Si el servidor no responde, igual limpia el estado local (fail-safe).

**Carga del perfil:** un `useEffect` observa el `token` y llama automáticamente a `GET /api/usuarios/mi-perfil` para hidratar el objeto `usuario` cuando hay un token activo.

---

### Hooks Personalizados

#### `useApi` (actualizado)

**Archivo:** `frontend/src/hooks/useApi.js`

Incluye un **interceptor automático de renovación de sesión**. Cuando cualquier petición recibe un `401`, el hook intenta renovar los tokens antes de reintentar la petición original de forma transparente.

**Variable global `promesaRenovacion`:**

Se declara fuera del hook (en el módulo), actúa como semáforo global. Si múltiples peticiones fallan con `401` al mismo tiempo, solo la primera llama a `/refresh`; las demás esperan a la misma promesa.

**Flujo del interceptor:**

```
Petición recibe 401 y no está reintentando y hay refreshToken
    │
    ├─ Si promesaRenovacion === null (soy el primero)
    │       └─ POST /api/usuarios/refresh → guarda la promesa
    │
    └─ Si promesaRenovacion !== null (alguien más está renovando)
            └─ Espero la misma promesa
    │
    ▼
await promesaRenovacion → { token, refreshToken }
    │
    ├─ Éxito: login(token, refreshToken), setUsuario(data)
    │          Reintenta la petición original con el nuevo token (reintentando=true)
    │
    └─ Fallo: logout() → redirige al login
```

---

#### `useN8nChat` — sin cambios

---

## 5. Flujos Funcionales

### Registro y Verificación de Cuenta

Sin cambios respecto a la versión anterior.

---

### Autenticación y Refresh Token

#### Login

```
POST /api/usuarios/login
    │  Valida body (schemaLoginUsuarios)
    │  Busca usuario por email
    │  bcrypt.compare(password, hash)
    │  Genera refreshToken = crypto.randomBytes(40).hex() 
    │  Calcula fecha expiración (+7 días)
    │  Valida con insertarTokenSchema (Joi)
    │  TokenModel.guardarRefreshToken() → INSERT refresh_tokens
    │  jwt.sign({ id, rol, email, nombre }, SECRET_KEY, { expiresIn: '15m' })
    │
    ▼
Respuesta: { token (15min), refreshToken (7 días), data }
    │
    ▼
AuthContext.login(token, refreshToken)
    │  Guarda ambos en estado React + localStorage
```

#### Renovación automática (interceptor)

```
useApi.ejecutarPeticion() recibe 401
    │
    ▼
promesaRenovacion === null → POST /api/usuarios/refresh { refreshToken }
    │  Busca token en BD
    │  Verifica: no revocado, no expirado
    │  Obtiene datos del usuario
    │  jwt.sign(..., { expiresIn: '15m' }) → nuevo access token
    │  TokenModel.revocarRefreshToken(viejo)
    │  TokenModel.guardarRefreshToken(nuevo, +7 días)
    │
    ▼
{ token, refreshToken } → AuthContext.login(token, refreshToken)
    │
    ▼
Reintento de la petición original con el nuevo token
```

#### Cierre de sesión

```
AuthContext.logout()
    │
    ▼
POST /api/usuarios/logout { refreshToken }
    │  TokenModel.revocarTokenEspecifico() → UPDATE revocado = '1'
    │
    ▼
localStorage.removeItem('token')
localStorage.removeItem('refreshToken')
setToken(null) / setRefreshToken(null) / setUsuario(null)
window.location = "/"
```

---

### Ciclo de Compra con Mercado Pago

```
1. Usuario agrega productos
   POST /api/carrito/agregar-carrito/:id

2. Usuario revisa el carrito
   GET /api/carrito/

3. Usuario inicia el pago
   POST /api/pagos/crear-preferencia
       │  Lee carrito del usuario
       │  Mapea items al formato de Mercado Pago
       │  Preference.create({ items, external_reference: userId, notification_url, back_urls })
       ▼
   { exito: true, init_point }
       │
       ▼
   Frontend redirige a init_point (portal de pago de Mercado Pago)

4. Usuario completa el pago en Mercado Pago

5. Mercado Pago notifica al backend vía webhook
   POST /api/pagos/webhook  (llamado por MP a la URL de ngrok)
   → Ver flujo detallado en sección siguiente

6. Mercado Pago redirige al usuario según el resultado
   - Éxito  → /pago-exitoso
   - Fallo  → /pago-fallido
   - Pendiente → /pago-pendiente
```

---

### Webhook de Mercado Pago

```
Mercado Pago envía POST a https://<ngrok-url>/api/pagos/webhook
    │
    ▼
recibirWebhook extrae paymentId del query (?id=...) o body (data.id)
    │
    ├─ topic !== 'payment' → responde 200, termina
    │
    ▼
Payment.get({ id: paymentId }) → consulta la API de MP
    │
    ├─ estado NOT IN ['approved', 'pending', 'in_process'] → responde 200, termina
    │
    ▼
    ┌──────────────────────────────────────────────────────────┐
    │ try {                                                     │
    │   ModelFactura.createFactura({                            │
    │     usuario_id: external_reference,                       │
    │     total: transaction_amount,                            │
    │     mp_payment_id: paymentId,        ← UNIQUE en BD      │
    │     estado: mapearEstadoMP(status)                       │
    │   })                                                     │
    │                                                          │
    │   Por cada item del carrito:                             │
    │     ModelDetalleFactura.createDetalleFactura(...)        │
    │                                                          │
    │   ModelCarrito.emptyCarrito(userId)                      │
    │   enviarEmailCompra(email, { items, total, ... })        │
    │                                                          │
    │ } catch (dbError) {                                      │
    │   if (SQLITE_CONSTRAINT || UNIQUE)                       │
    │     → pago duplicado, ignorar silenciosamente            │
    │   else                                                   │
    │     → log del error crítico                              │
    │ }                                                        │
    └──────────────────────────────────────────────────────────┘
    │
    ▼
Responde 200 OK (siempre, para que MP no reintente)
```

---

### Carga Masiva de Productos

Sin cambios respecto a la versión anterior.

---

### Recuperación de Contraseña

Sin cambios respecto a la versión anterior.

---

## 6. Seguridad

| Aspecto | Implementación |
|---|---|
| **Contraseñas** | Hash con `bcrypt`, salt 10 |
| **Access token** | JWT firmado con `SECRET_KEY`, expiración **15 minutos** |
| **Refresh token** | String opaco de 80 caracteres hex (`crypto.randomBytes(40)`), nunca un JWT |
| **Rotación de tokens** | Cada uso del refresh token lo invalida y genera uno nuevo. Un token reutilizado es rechazado inmediatamente |
| **Revocación explícita** | El logout revoca el refresh token en la BD. El token queda marcado como `revocado = 1` |
| **Semáforo anti-race** | La variable global `promesaRenovacion` en `useApi` evita múltiples renovaciones simultáneas con el mismo token |
| **Validación Joi previa a la BD** | El refresh token se valida con `insertarTokenSchema` antes de insertarse |
| **Autorización** | Doble middleware: `verificarToken` + `verificarAdmin` |
| **SQL Injection** | Todas las queries usan parámetros preparados (`args: [...]`) |
| **CORS** | Solo acepta `localhost:5173` y el dominio de producción |
| **Subida de archivos** | Multer filtra por MIME type, almacenamiento en memoria |
| **Variables de entorno** | Todas las credenciales en `.env` vía `dotenv` |
| **Idempotencia de pagos** | `mp_payment_id` UNIQUE en `facturas` previene facturas duplicadas por webhooks repetidos |
| **Webhook sin autenticación** | El endpoint `/api/pagos/webhook` no requiere JWT (lo llama Mercado Pago), pero valida el payload consultando directamente la API de MP con el `paymentId` recibido |

---

## 7. Asistente Virtual

Sin cambios respecto a la versión anterior. Ver README para el flujo completo de N8N + Ollama.

---

## 8. Infraestructura Local con ngrok

### Propósito

Mercado Pago necesita una URL **pública y accesible desde internet** para enviar las notificaciones webhook cuando un pago cambia de estado. En desarrollo, el servidor corre en `localhost:3000`, que no es accesible externamente. **ngrok** resuelve esto creando un túnel que expone el puerto local a una URL pública HTTPS.

### Diagrama de flujo

```
Mercado Pago (servidores de MP)
        │
        │  POST https://xxxx.ngrok-free.app/api/pagos/webhook
        │
        ▼
   ngrok (proceso local)
        │
        │  Reenvía la request a localhost:3000
        │
        ▼
   Express /api/pagos/webhook
        │
        │  Procesa el pago
```

### Configuración

1. Instalar ngrok: https://ngrok.com/download
2. Autenticar: `ngrok config add-authtoken <token>`
3. Levantar el túnel con el backend corriendo: `ngrok http 3000`
4. Copiar la URL generada (ej: `https://abc123.ngrok-free.app`)
5. Actualizar `notification_url` en `controllerPago.js`:

```js
notification_url: "https://abc123.ngrok-free.app/api/pagos/webhook",
```

### Consideraciones

- En el **plan gratuito** de ngrok, la URL pública cambia cada vez que se reinicia ngrok. Hay que actualizarla en el controller con cada nueva sesión.
- En el **plan pago** se puede reservar un subdominio fijo.
- En **producción**, la `notification_url` debe apuntar al dominio real del servidor desplegado; ngrok ya no es necesario.
- ngrok también ofrece un panel de inspección en `http://localhost:4040` donde se pueden ver todas las requests recibidas, incluyendo los webhooks de Mercado Pago, lo que es muy útil para depurar.