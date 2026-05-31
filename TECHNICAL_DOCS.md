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
   - [Ciclo de Compra](#ciclo-de-compra)
   - [Carga Masiva de Productos](#carga-masiva-de-productos)
   - [Recuperación de Contraseña](#recuperación-de-contraseña)
6. [Seguridad](#6-seguridad)
7. [Asistente Virtual](#7-asistente-virtual)

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
        │  Webhook (N8N)                │
        │ ─────────────────────────►  N8N ── Ollama (qwen3:8b)  IA del chatbot
```

- **Frontend:** SPA construida con React 19 y Vite. Se comunica con el backend exclusivamente mediante `fetch` a través del hook `useApi`, que incluye un interceptor automático de renovación de sesión.
- **Backend:** API REST construida con Express 5, organizada en capas (routes → middlewares → controllers → models).
- **Base de datos:** Turso, una base de datos LibSQL (SQLite compatible) serverless alojada en la nube. La conexión se establece mediante `@libsql/client`.
- **Imágenes:** Las imágenes de productos se almacenan en Cloudinary. Solo las URLs resultantes se guardan en la base de datos.
- **Emails:** Nodemailer conectado a Gmail vía contraseña de aplicación para enviar códigos de verificación y recuperación de contraseña.
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

#### `refresh_tokens` *(nuevo)*

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

> **Cambio respecto a la versión anterior:** ahora responde `401` (en lugar de `403`) cuando el token es inválido o expiró, para que el interceptor del frontend pueda distinguirlo correctamente y activar el flujo de renovación.

Payload almacenado en `req.user`:
```json
{
  "id": 1,
  "rol": "cliente",
  "email": "usuario@gmail.com",
  "nombre": "Juan"
}
```

Los access tokens tienen una expiración de **15 minutos** (reducida desde 1 hora para mayor seguridad).

---

#### `verificarAdmin`

**Archivo:** `backend/src/middlewares/verificarAdmin.js`

Debe ejecutarse siempre después de `verificarToken`. Comprueba que `req.user.rol === 'admin'`. Si no es admin, responde con `403`.

---

#### `uploadImg` / `uploadMiddleware`

Sin cambios respecto a la versión anterior. Ver documentación previa.

---

### Modelos

#### `UsuarioModel` — sin cambios relevantes

#### `ModelProductos` — sin cambios relevantes

#### `ModelCarrito` — sin cambios relevantes

#### `ModelFactura` — sin cambios relevantes

---

#### `ModelDetalleFactura` *(nuevo)*

**Archivo:** `backend/src/models/modelDetalleFactura.js`

Separado del `ModelFactura` en su propio archivo para una mejor separación de responsabilidades.

| Método | Descripción |
|---|---|
| `createDetalleFactura(facturaId, productoId, cantidad, precioUnitario)` | Inserta una línea de detalle en `detalles_factura` |
| `getDetallesFacturaByFacturaId(facturaId)` | JOIN entre `detalles_factura`, `productos` y `facturas`. Devuelve cantidad, precio unitario, nombre y imagen del producto, fecha y usuario_id de la factura |

---

#### `TokenModel` *(nuevo)*

**Archivo:** `backend/src/models/modelToken.js`

Gestiona el ciclo de vida completo de los refresh tokens en la tabla `refresh_tokens`.

| Método | Descripción |
|---|---|
| `guardarRefreshToken(refreshToken, idUsuario, fechaExpiracionStr)` | Inserta un nuevo refresh token activo |
| `buscarRefreshToken(refreshToken)` | Busca el token por su valor; devuelve la fila completa o `null` |
| `revocarRefreshToken(refreshToken)` | Soft delete: setea `revocado = 1` |
| `revocarTokenEspecifico(refreshToken)` | Ídem, con valor de `revocado` como string `'1'` (para compatibilidad con Turso BOOLEAN) |

---

### Controllers

#### `controlerUsuario` — cambios y nuevas funciones

##### `login` (actualizado)

Además de generar el JWT, ahora:
1. Genera un refresh token opaco con `crypto.randomBytes(40).toString('hex')` (80 caracteres hex).
2. Calcula la fecha de expiración a 7 días.
3. Valida ambos datos con `insertarTokenSchema` (Joi) antes de tocar la base de datos.
4. Llama a `TokenModel.guardarRefreshToken()` para persistir el token.
5. Devuelve `{ token, refreshToken, data }` en la respuesta.

El access token ahora expira en **15 minutos** (antes era 1 hora).

---

##### `renovarSesion` *(nuevo)*

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

El paso 7-8 garantiza que cada refresh token solo puede usarse **una vez**. Si un token ya usado es presentado de nuevo, se detecta como revocado y se rechaza, lo que indica un posible robo del token.

---

##### `cerrarSesion` *(nuevo)*

Endpoint: `POST /api/usuarios/logout`

No requiere autenticación JWT. Recibe el `refreshToken` en el body y llama a `TokenModel.revocarTokenEspecifico()` para marcarlo como revocado. Si el servidor no puede ser contactado, el frontend igualmente limpia el estado local.

---

#### `controllerFactura` (actualizado)

- `crearFactura`: ahora usa `ModelDetalleFactura.createDetalleFactura()` (modelo separado) en lugar de tener la lógica de inserción embebida.
- `obtenerFacturasDeUsuario`: incorpora **formateo de fechas** antes de devolver la respuesta. Convierte `fecha` de UTC a zona horaria `America/Argentina/Buenos_Aires` con formato corto (`"14 may. 2026"`), añadiendo el campo `fecha_formateada` a cada factura.
- `actualizarEstadoFactura`: nuevo endpoint para que los admins puedan cambiar el estado de una factura. Valida que el estado sea uno de los valores del objeto `ESTADOS`.

---

### Schemas de Validación

#### Schemas nuevos

##### `schemaRefreshToken.js`

Dos schemas exportados con nombre:

| Schema | Uso | Campos |
|---|---|---|
| `insertarTokenSchema` | Valida datos antes de guardar en la BD | `idUsuario` (integer positivo), `refreshToken` (string min 20), `fechaExpiracionStr` (ISO 8601) |
| `renovarTokenRequestSchema` | Valida el body del endpoint `POST /refresh` | `refreshToken` (string requerido) |

---

##### `schemaVerificacion.js`

Valida el body del endpoint `POST /verificar`:

| Campo | Regla |
|---|---|
| `codigo` | string de exactamente 6 caracteres, requerido |

---

##### `schemaResetPassword.js`

Valida el body del endpoint `POST /reset-password`:

| Campo | Regla |
|---|---|
| `email` | email válido, dominios `.com`, `.net`, `.ar` |
| `codigo` | string de exactamente 6 caracteres |
| `nuevaPassword` | string 6-30 caracteres |

---

##### `schemaStaff.js`

Dos schemas exportados con nombre:

| Schema | Uso |
|---|---|
| `schemaRegistroStaff` | Alta de nuevo admin: `nombre` (3-50), `email`, `password` (mín 8 caracteres) |
| `schemaActualizarStaff` | Actualización parcial: `nombre` y `email` opcionales |

---

##### `schemaUpdateUsuario.js`

Tres schemas exportados:

| Schema | Uso |
|---|---|
| `schemaUpdateUsuario` | Actualización de perfil: `email` requerido, `password` opcional |
| `schemaActualizarPassword` | Cambio de contraseña: `password` de 8-30 caracteres |
| `schemaActualizarNombre` | Cambio de nombre: `nombre` de 2-50 caracteres con `.trim()` |

---

##### `schemaUpdateProducto.js`

Schema para la actualización parcial de productos (`.min(1)` obliga a enviar al menos un campo). Todos los campos son opcionales. Reutiliza las constantes `CAPACIDADES_PERMITIDAS` y `CONDICIONES_PERMITIDAS` del schema principal de productos.

---

##### `schemaQueriesFiltros.js`

Valida los query params del endpoint `GET /productos`. Incluye todos los filtros del sistema:

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

Sin cambios respecto a la versión anterior.

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

Sin cambios en las rutas disponibles respecto a la versión anterior.

---

### Componentes

Sin cambios en los componentes respecto a la versión anterior.

---

### Contextos Globales

#### `AuthContext` (actualizado)

**Archivo:** `frontend/src/context/AuthContext.jsx`

Maneja el estado de autenticación en toda la aplicación. Ahora gestiona también el refresh token y el objeto completo del usuario.

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

Se declara fuera del hook (en el módulo), actúa como semáforo global. Si múltiples peticiones fallan con `401` al mismo tiempo, solo la primera llama a `/refresh`; las demás esperan a la misma promesa. Esto evita múltiples llamadas simultáneas de renovación con el mismo refresh token.

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

**Parámetro `reintentando`:**

El tercer parámetro de `ejecutarPeticion` evita loops infinitos: si una petición ya es un reintento y recibe otro `401`, no vuelve a intentar renovar, sino que lanza el error directamente.

**Lectura del token:**

El token se lee en cada petición desde `localStorage` (no solo desde el estado de React) para garantizar que siempre se usa el valor más reciente, incluso si el estado de React aún no se actualizó.

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

### Ciclo de Compra

```
1. Usuario agrega productos
   POST /api/carrito/agregar-carrito/:id

2. Usuario revisa el carrito
   GET /api/carrito/

3. Confirma compra
   POST /api/facturas/crear-factura
       │  Lee carrito del usuario
       │  Calcula total (.toFixed(2))
       │  ModelFactura.createFactura() → INSERT facturas
       │  Por cada item: ModelDetalleFactura.createDetalleFactura()
       │  ModelCarrito.emptyCarrito()
       ▼
   { idFactura, total }

4. Admin puede cambiar el estado
   PATCH /api/facturas/:id/estado
       │  Valida nuevo estado contra objeto ESTADOS
       │  ModelFactura.updateEstadoFactura()

5. Usuario descarga PDF
   GET /api/facturas/detalle-factura/:id/pdf
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
| **Access token** | JWT firmado con `SECRET_KEY`, expiración **15 minutos** (reducida desde 1h) |
| **Refresh token** | String opaco de 80 caracteres hex (`crypto.randomBytes(40)`), nunca un JWT |
| **Rotación de tokens** | Cada uso del refresh token lo invalida y genera uno nuevo. Un token reutilizado es rechazado inmediatamente |
| **Revocación explícita** | El logout revoca el refresh token en la BD. El token queda marcado como `revocado = 1` |
| **Semáforo anti-race** | La variable global `promesaRenovacion` en `useApi` evita múltiples renovaciones simultáneas con el mismo token |
| **Validación Joi previa a la BD** | El refresh token se valida con `insertarTokenSchema` antes de insertarse. El body de `/refresh` se valida con `renovarTokenRequestSchema` |
| **Autorización** | Doble middleware: `verificarToken` + `verificarAdmin` |
| **SQL Injection** | Todas las queries usan parámetros preparados (`args: [...]`) |
| **CORS** | Solo acepta `localhost:5173` y el dominio de producción |
| **Subida de archivos** | Multer filtra por MIME type, almacenamiento en memoria |
| **Variables de entorno** | Todas las credenciales en `.env` vía `dotenv` |

---

## 7. Asistente Virtual

Sin cambios respecto a la versión anterior. Ver documentación previa para el flujo completo de N8N + Ollama.