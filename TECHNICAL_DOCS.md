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
   - [Autenticación (Login)](#autenticación-login)
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

- **Frontend:** SPA (Single Page Application) construida con React 19 y Vite. Se comunica con el backend exclusivamente mediante `fetch` a través del hook `useApi`.
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
| `rol` | TEXT | DEFAULT `'cliente'` | Puede ser `'cliente'` o `'admin'` |
| `verificado` | TEXT | DEFAULT `'falso'` | `'falso'` o `'verdadero'` / `1` tras verificar |
| `codigo_verificacion` | TEXT | — | Código de 6 dígitos temporal (se limpia tras usar) |
| `activo` | INTEGER | DEFAULT `1` | Borrado lógico: `0` = dado de baja |

---

#### `productos`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `nombre_producto` | TEXT | NOT NULL | Nombre del producto |
| `precio` | REAL | NOT NULL, CHECK > 0 | Precio en la moneda configurada |
| `capacidad` | TEXT | — | Array serializado como JSON (ej: `["128GB","256GB"]`) |
| `descripcion` | TEXT | — | Descripción libre |
| `imagen_url` | TEXT | — | Array de URLs serializado como JSON |
| `categoria` | TEXT | NOT NULL | Ver [categorías válidas](#categorías-válidas) |
| `condicion` | TEXT | NOT NULL, CHECK | `'nuevo'`, `'reacondicionado'` o `'usado'` |
| `activo` | INTEGER | DEFAULT `1` | Borrado lógico: `0` = eliminado |
| `fecha_creacion` | — | DEFAULT CURRENT_TIMESTAMP | Fecha de alta |
| `bateria` | INTEGER | DEFAULT NULL | Porcentaje de batería (solo para `celulares` y `tablets`) |

> **Columnas JSON:** `capacidad` e `imagen_url` se almacenan como strings JSON. El controller se encarga de serializar con `JSON.stringify()` al escribir y deserializar con `JSON.parse()` al leer, antes de devolver la respuesta.

---

#### `carrito`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `usuario_id` | INTEGER | FK → usuarios.id, ON DELETE CASCADE | Propietario del carrito |
| `producto_id` | INTEGER | FK → productos.id, ON DELETE CASCADE | Producto en el carrito |
| `cantidad` | INTEGER | DEFAULT `1` | Unidades del producto |

> Si se agrega un producto que ya existe en el carrito del mismo usuario, el modelo incrementa la `cantidad` existente en lugar de insertar una nueva fila.

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

> `precio_unitario` guarda el precio en el momento de la compra. Esto es importante porque si el precio del producto cambia en el futuro, la factura histórica conserva el valor correcto.

---

#### `lista_deseados`

| Columna | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Identificador único |
| `usuario_id` | INTEGER | FK → usuarios.id, ON DELETE CASCADE | Usuario dueño de la lista |
| `producto_id` | INTEGER | FK → productos.id, ON DELETE CASCADE | Producto deseado |
| — | — | UNIQUE(usuario_id, producto_id) | Evita duplicados |

---

### Relaciones

```
usuarios ──────────────────────┐
    │ 1                         │ 1
    │ N                         │ N
  carrito                  facturas ──── N ──── detalles_factura
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
- **Eliminación en cascada:** Si se elimina un usuario, su carrito y lista de deseados se eliminan automáticamente (`ON DELETE CASCADE`). Las facturas quedan huérfanas con `usuario_id = NULL` (`ON DELETE SET NULL`).
- **Paginación:** Los endpoints de listado (`/productos`, `/facturas`) aceptan `page` y `limit` como query params. El modelo ejecuta dos queries en paralelo: una con `LIMIT / OFFSET` para los datos y otra con `COUNT(*)` para el total. Esto permite que el frontend construya la navegación.

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

Si el header está ausente, tiene formato incorrecto, o el token expiró / fue manipulado, responde con `401` o `403` respectivamente sin continuar la cadena.

Payload que se almacena en `req.user`:
```json
{
  "id": 1,
  "rol": "cliente",
  "email": "usuario@gmail.com",
  "nombre": "Juan"
}
```

Los tokens tienen una expiración de **1 hora** (`expiresIn: '1h'`).

---

#### `verificarAdmin`

**Archivo:** `backend/src/middlewares/verificarAdmin.js`

Debe ejecutarse **siempre después** de `verificarToken` (que ya garantiza que `req.user` existe). Comprueba que `req.user.rol === 'admin'`. Si no es admin, responde con `403`. Si lo es, pasa al siguiente handler.

```
router.post('/registrar', verificarToken, verificarAdmin, registrarStaff);
//                              ↑               ↑
//                         1. autentica    2. autoriza
```

---

#### `uploadImg` (multer + Cloudinary)

**Archivo:** `backend/src/middlewares/fileFilter.js`

Middleware de Multer configurado con `memoryStorage` (no guarda en disco) y un filtro de tipo MIME que acepta únicamente imágenes (`image/*`). Las rutas de creación de productos usan `uploadImg.array('imagen_url', 3)` para aceptar hasta 3 imágenes por producto.

---

#### `uploadMiddleware` (carga masiva)

**Archivo:** `backend/src/middlewares/multer.js`

Multer para un único archivo (`single`). Acepta `.csv`, `.xlsx` y `.json`. Usado exclusivamente por el endpoint de carga masiva.

---

### Modelos

Todos los modelos son clases con métodos estáticos. La conexión a la base de datos (`db`) se obtiene al inicio del módulo de forma asíncrona con `await obtenerDb()`.

#### `UsuarioModel`

| Método | Descripción |
|---|---|
| `getAll()` | Devuelve todos los usuarios activos |
| `getbyId(id)` | Usuario por ID (activo) |
| `buscarEmail(email)` | Busca usuario por email (activo) |
| `createUser(data)` | Inserta nuevo usuario con código de verificación |
| `updateUserPassword(id, hash)` | Actualiza la contraseña por ID |
| `updatePasswordClearCodeVerificate(email, password, codigo)` | Actualiza contraseña + marca verificado + limpia el código en una sola query |
| `guardarCodigoVerificacion(id, codigo)` | Guarda un código de reseteo en el usuario |
| `actualizarVerificado(id)` | Marca `verificado = 1` y limpia el código |
| `getRol(id)` | Devuelve solo el rol del usuario |
| `actualizarNombre(id, nombre)` | Actualiza el nombre visible del usuario |

---

#### `ModelProductos`

| Método | Descripción |
|---|---|
| `getAll(filtros, limit, offset)` | Listado paginado con filtros dinámicos |
| `countProductos(filtros)` | Cuenta total de productos para la paginación |
| `getById(id)` | Producto único por ID (activo) |
| `createProduct(data)` | Inserta producto; serializa `capacidad` e `imagen_url` a JSON |
| `updateProduct(id, data)` | Actualiza campos dinámicamente (construye el SET con las keys del objeto) |
| `deleteProduct(id)` | Borrado lógico (`activo = 0`) + limpia registros en `carrito` |
| `insertMany(array)` | Inserta múltiples productos usando `db.batch()` (transacción Turso) |

**Sistema de filtros:** `getAll` y `countProductos` construyen la query SQL dinámicamente. Cada filtro opcional agrega un `AND` a la cláusula `WHERE` con su parámetro correspondiente:

| Filtro | Query generada |
|---|---|
| `categoria` | `AND categoria LIKE '%valor%'` |
| `condicion` | `AND condicion LIKE '%valor%'` |
| `capacidad` | `AND capacidad LIKE '%"valor"%'` (busca dentro del JSON) |
| `precioMin` | `AND precio >= valor` |
| `precioMax` | `AND precio <= valor` |
| `busqueda` | `AND nombre_producto LIKE '%valor%'` |
| `bateriaMin` | `AND bateria >= valor` |
| `orden` | `ORDER BY fecha_creacion ASC/DESC` |

---

#### `ModelCarrito`

| Método | Descripción |
|---|---|
| `getCarrito(usuarioId)` | JOIN con `productos`, devuelve items con nombre, precio e imagen |
| `addCarrito(usuarioId, productoId, cantidad)` | Upsert: si existe incrementa cantidad, si no inserta |
| `deleteProductFromCarrito(usuarioId, productoId)` | Reduce cantidad en 1; si llega a 0 elimina la fila |
| `deleteAWholeProductFromCarrito(usuarioId, productoId)` | Elimina la fila completa sin importar la cantidad |
| `emptyCarrito(usuarioId)` | Elimina todos los registros del usuario |

---

#### `ModelFactura`

| Método | Descripción |
|---|---|
| `createFactura(usuarioId, total)` | Inserta factura y devuelve el `lastInsertRowid` |
| `getFacturaById(id)` | Factura por ID |
| `getFacturas(limit, offset)` | Todas las facturas paginadas (uso admin) |
| `countFacturas()` | Total de facturas para la paginación admin |
| `getFacturasDeUsuario(usuarioId, limit, offset)` | Facturas del usuario, paginadas |
| `countFacturasDeUsuario(usuarioId)` | Total de facturas del usuario |
| `updateEstadoFactura(facturaId, nuevoEstado)` | Cambia el estado de una factura |

---

#### `ModelListaDeseados`

| Método | Descripción |
|---|---|
| `addWishList(usuarioId, productoId)` | Usa `INSERT OR IGNORE` para evitar duplicados silenciosamente |
| `getWishListByUserId(usuarioId)` | JOIN con `productos`, devuelve nombre, precio, condición, imágenes |
| `removeWishList(usuarioId, productoId)` | Elimina el registro; devuelve `true/false` |
| `countWishListByUserId(usuarioId)` | Cuenta productos en la lista |
| `isProductInWishList(usuarioId, productoId)` | Verifica si un producto específico ya está en la lista (`SELECT 1`) |

---

#### `ModelStaff`

Trabaja sobre la tabla `usuarios` filtrando siempre por `rol = 'admin'` (usando la constante `ROLES.ADMIN`).

| Método | Descripción |
|---|---|
| `obtenerStaff()` | Lista todos los admins |
| `actualizarDatosBasicos(id, data)` | Update dinámico (mismo patrón que `ModelProductos.updateProduct`) |
| `verificarEmailExistente(email)` | Verifica si el email ya existe antes de crear un nuevo admin |
| `crearStaff(nombre, email, passwordHash)` | Crea usuario con `rol = 'admin'` hardcodeado |
| `darBajaStaff(id)` | Borrado lógico (`activo = 0`), solo si es admin |
| `restaurarStaff(id)` | Reactiva admin (`activo = 1`) |
| `obtenerDatosBasicosPorId(id)` | Devuelve solo `nombre` y `email` del admin |
| `actualizarPassword(id, hash)` | Blanqueo de contraseña, solo admins activos |

---

### Controllers

#### `controllerProductos`

- **`obtenerProductos`:** Valida query params con `schemaFiltrosProductos`, ejecuta `getAll` y `countProductos` en paralelo con `Promise.all`, parsea los campos JSON de cada producto antes de responder.
- **`obtenerProducto`:** Obtiene producto por ID, parsea `imagen_url` y `capacidad`.
- **`crearProducto`:** Sube imágenes a Cloudinary en paralelo → valida con `schemaProductos` → si la validación falla, elimina las imágenes ya subidas de Cloudinary para evitar archivos huérfanos.
- **`actualizarProducto`:** Valida con `schemaActualizarProducto` → serializa `capacidad` a JSON si viene en el body → llama a `updateProduct`.
- **`eliminarProducto`:** Borrado lógico vía `deleteProduct`.
- **`bulkUpload`:** Lee el archivo en memoria → detecta extensión (csv/xlsx/json) → parsea con `procesarArchivo` → mapea y normaliza campos → valida el array completo con Joi → inserta con `insertMany`.

---

#### `controlerUsuario`

- **`registro`:** Valida body → verifica email único → hashea contraseña con bcrypt (salt 10) → genera código de 6 dígitos con `crypto.randomInt` → crea usuario → envía email de verificación de forma asíncrona (`.catch` para no bloquear la respuesta).
- **`login`:** Valida body → busca usuario por email → compara contraseña con `bcrypt.compare` → genera JWT con payload `{id, rol, email, nombre}`, expiración 1h → devuelve el token y datos básicos del usuario.
- **`verificar`:** Extrae `id` de `req.user` → compara el código enviado con el almacenado → llama a `actualizarVerificado`.
- **`obtenerPerfil`:** Devuelve `{id, nombre, email, rol}` del usuario autenticado.
- **`actualizarNombreUsuario`:** Valida el nuevo nombre → llama a `actualizarNombre`.

---

### Schemas de Validación

Todos los schemas usan **Joi**. Las rutas validan antes de ejecutar cualquier lógica de negocio.

#### Schema de Producto (`schemaProductos`)

| Campo | Regla |
|---|---|
| `nombre_producto` | string, 3-50 chars, requerido |
| `precio` | number positivo, requerido |
| `capacidad` | array de strings, valores permitidos: `16GB`, `32GB`, `64GB`, `128GB`, `256GB`, `512GB`, `1TB`, `2TB` |
| `descripcion` | string, máx 500 chars, opcional |
| `imagen_url` | array de URLs válidas (Joi.uri()) |
| `categoria` | string, debe ser una de las [categorías válidas](#categorías-válidas) |
| `condicion` | `'nuevo'`, `'reacondicionado'` o `'usado'` |
| `bateria` | integer 70-100, solo si `categoria` es `'celulares'` o `'tablets'`; se stripea en cualquier otro caso |

#### Schema de Registro

| Campo | Regla |
|---|---|
| `nombre` | string, 3-50 chars |
| `email` | email válido, dominios permitidos: `.com`, `.net`, `.ar` |
| `password` | string, 6-30 chars |

#### Schema de Login

| Campo | Regla |
|---|---|
| `email` | email válido |
| `password` | string no vacío |

---

### Utilidades

#### `mailer.js`

Configura un transporter de Nodemailer con Gmail. Expone dos funciones:
- `enviarCorreoVerificacion(email, codigo)` — Email de bienvenida con el código de activación.
- `enviarCorreoRecuperacion(email, codigo)` — Email con código para resetear la contraseña.

#### `manejarImagenes.js`

- `subirACloudinary(buffer, categoria, nombre)` — Sube un buffer de imagen a Cloudinary en una carpeta organizada por `categoria/nombre`. Devuelve la URL pública.
- `eliminarDeCloudinary(url)` — Extrae el `public_id` desde la URL y elimina la imagen. Se usa como rollback si la validación falla después de subir.

#### `leerArchivos.js`

- `procesarArchivo(buffer, extension, separador)` — Función router que delega según la extensión:
  - `.csv` → parsea con `csv-parser`
  - `.xlsx` → parsea con `exceljs`
  - `.json` → `JSON.parse`

#### `descargarFacturaPDF.js`

Genera un PDF con `pdfkit` a partir del detalle de una factura. Incluye información del usuario, fecha, listado de productos con cantidades y precios unitarios, y el total. Envía el PDF como stream directamente en la respuesta HTTP.

#### `roles.js` / `estados.js`

Constantes del sistema congeladas con `Object.freeze`:

```js
// roles.js
ROLES = { CLIENTE: "cliente", ADMIN: "admin" }

// estados.js
ESTADOS = { PENDIENTE, COMPLETADO, ENVIADO, CANCELADO, REEMBOLSADO }
```

---

### Constantes del Sistema

#### Categorías válidas

```
celulares | tablets | relojes | auriculares | cargadores | cables | powerbanks | fundas | protectores | accesorios
```

Solo `celulares` y `tablets` admiten los campos `bateria` y `capacidad`.

#### Estados de factura

```
Pendiente | Completado | Enviado | Cancelado | Reembolsado
```

El estado por defecto al crear una factura es `'Completado'`.

---

## 4. Frontend

### Páginas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home.jsx` | Landing con hero, productos destacados y secciones informativas |
| `/catalogo` | `CatalogoDeProductos.jsx` | Listado con filtros, búsqueda y paginación |
| `/producto/:id` | `Product.jsx` | Detalle de producto, galería, selección de capacidad y productos relacionados |
| `/carrito` | `Carrito.jsx` | Gestión del carrito y proceso de compra (solo autenticado) |
| `/inicio-sesion` | `InicioSesion.jsx` | Formulario de login |
| `/registro` | `Registro.jsx` | Formulario de registro con medidor de fortaleza de contraseña |
| `/recuperar-password` | `RecuperarContraseña.jsx` | Solicitud y validación de código de recuperación |
| `/perfil-usuario` | `PerfilUsuario.jsx` | Perfil, historial de facturas, lista de deseados, edición de datos |
| `/admin` | `GestionAdmin.jsx` | Panel admin: productos, carga masiva, staff, facturas |

> La ruta `/carrito` solo se registra en el router si `estaAutenticado === true` (condición en `App.jsx`). Las rutas `/admin` no muestran `Navbar` ni `Footer`.

---

### Componentes

#### `components/layout/`
- **`Navbar`** — Barra de navegación. Muestra links según el estado de autenticación. Incluye contador del carrito.
- **`Footer`** — Pie de página global.

#### `components/admin/`
- **`TablaDeProductos`** — Tabla con listado paginado de productos del panel admin.
- **`ProductosFila`** — Fila individual de la tabla de productos.
- **`ModalNuevoProducto`** / **`ModaleNuevoProducto`** — Modal para dar de alta un nuevo producto con subida de imágenes.
- **`CargaMasiva`** — Formulario para subir archivo CSV/Excel de productos.
- **`SidebarAdmin`** — Navegación lateral del panel admin.
- **`HeaderAdmin`** — Cabecera del panel admin.
- **`SkeletonFilaLoader`** / **`SkeletonFilaProducto`** — Skeletons de carga para la tabla.

#### `components/productos/`
- **`CartaDeProductos`** — Tarjeta de producto para el catálogo.
- **`ImageGallery`** — Galería de imágenes en el detalle de producto.
- **`CapacitySelector`** — Selector de capacidad (ej: 128GB / 256GB).
- **`DescripcionProducto`** — Sección de descripción en el detalle.
- **`ProductosRelacionados`** — Grilla de productos de la misma categoría.
- **`BotonDeseados`** — Botón con estado para agregar/quitar de la lista de deseados.
- **`FiltroRadioGroup`** — Grupo de filtros radio para el catálogo.
- **`Condition`** — Badge de condición (nuevo/usado/reacondicionado).
- **`ProductSearchCard`** — Tarjeta compacta para resultados de búsqueda.

#### `components/chat/`
- **`N8nChat`** — Componente flotante del chatbot. Mantiene el historial de mensajes en estado local. Usa el hook `useN8nChat` para comunicarse con el webhook de N8N.
- **`ChatInput`** — Input de texto del chat.

#### `components/common/`
Componentes reutilizables sin lógica de negocio:

| Componente | Descripción |
|---|---|
| `InputGenerico` | Input estilizado para formularios |
| `InputPassword` | Input con toggle de visibilidad |
| `BtnForm` | Botón de submit para formularios |
| `BtnAccion` | Botón genérico de acción |
| `ErrorCard` | Tarjeta de error |
| `SuccessCard` | Tarjeta de éxito |
| `LoadingCard` | Spinner de carga |
| `SkeletonLoader` | Skeleton genérico de carga |
| `Paginacion` | Controles de paginación |
| `BadgeEstado` | Badge del estado de una factura |
| `BadgeSeguro` | Badge de garantía |
| `MensajeSinResultado` | Mensaje vacío cuando no hay datos |
| `PasswordStrengthBar` | Barra visual de fortaleza de contraseña |

#### `components/cuenta/`
- **`HistorialFacturas`** — Lista paginada de facturas del usuario con link para descargar PDF.

---

### Contextos Globales

#### `AuthContext`

**Archivo:** `frontend/src/context/AuthContext.jsx`

Maneja el estado de autenticación en toda la aplicación.

| Valor expuesto | Tipo | Descripción |
|---|---|---|
| `token` | string \| null | JWT almacenado en `localStorage` |
| `estaAutenticado` | boolean | `true` si hay token |
| `login(token)` | función | Guarda el token en estado y `localStorage` |
| `logout()` | función | Limpia el token y redirige a `/` |

El token se inicializa leyendo `localStorage` una sola vez. Un `useEffect` sincroniza el estado con `localStorage` cada vez que el token cambia.

```jsx
// Uso en cualquier componente
const { estaAutenticado, token, login, logout } = useAuth();
```

---

#### `CarritoContext`

**Archivo:** `frontend/src/context/CarritoContext.jsx`

Maneja el estado local del carrito de compras (sincronizado con `localStorage`).

| Valor expuesto | Tipo | Descripción |
|---|---|---|
| `cartItems` | array | Productos en el carrito |
| `cartCount` | number | Total de unidades |
| `subtotal` | number | Suma de `precio × cantidad` |
| `addToCart(product)` | función | Agrega o incrementa cantidad |
| `removeFromCart(id)` | función | Elimina el producto del array |
| `increaseQuantity(id)` | función | +1 unidad |
| `decreaseQuantity(id)` | función | -1 unidad (mínimo 1) |

> El carrito del contexto es **local** (localStorage). Al confirmar la compra se sincroniza con el backend vía el endpoint `/api/carrito` y `/api/facturas/crear-factura`.

---

### Hooks Personalizados

#### `useApi`

**Archivo:** `frontend/src/hooks/useApi.js`

Abstrae todas las llamadas HTTP al backend. Maneja `isLoading`, `error` y la URL base.

```js
const { ejecutarPeticion, isLoading, error } = useApi();

// Ejemplo de uso
const resultado = await ejecutarPeticion('productos/productos', {
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` }
});
```

Detecta automáticamente si el body es `FormData` y omite el header `Content-Type` en ese caso (necesario para que el browser establezca el boundary correcto en multipart).

---

#### `useN8nChat`

**Archivo:** `frontend/src/hooks/useN8nChat.js`

Maneja la comunicación con el webhook de N8N. Envía el mensaje del usuario y el historial completo de la conversación en cada petición, de forma que el modelo tenga contexto del hilo.

---

## 5. Flujos Funcionales

### Registro y Verificación de Cuenta

```
Usuario rellena formulario
    │
    ▼
POST /api/usuarios/registro
    │  Valida schema (Joi)
    │  Verifica email único
    │  Hash de contraseña (bcrypt, salt 10)
    │  Genera código 6 dígitos (crypto.randomInt)
    │  Crea usuario (verificado = 'falso')
    │  Envía email async (no bloquea respuesta)
    │
    ▼
Respuesta 201 → "Revisa tu correo"
    │
    ▼
Usuario ingresa código desde el email
    │
    ▼
POST /api/usuarios/verificar  (requiere token JWT)
    │  Compara código ingresado con codigo_verificacion
    │  UPDATE: verificado = 1, codigo_verificacion = NULL
    │
    ▼
Cuenta activada
```

---

### Autenticación (Login)

```
POST /api/usuarios/login
    │  Busca usuario por email
    │  bcrypt.compare(password, hash)
    │  Genera JWT { id, rol, email, nombre }, expiresIn: '1h'
    │
    ▼
Respuesta: { token, data: { id, nombre, rol } }
    │
    ▼
AuthContext.login(token)
    │  Guarda en estado React + localStorage
    │
    ▼
Todas las requests siguientes incluyen:
Authorization: Bearer <token>
```

---

### Ciclo de Compra

```
1. Usuario agrega productos al carrito
   POST /api/carrito/agregar-carrito/:id
   (upsert: incrementa si ya existe)

2. Usuario revisa el carrito
   GET /api/carrito/

3. Usuario confirma compra
   POST /api/facturas/crear-factura
       │  Lee el carrito del usuario en la BD
       │  Crea registro en `facturas` con el total
       │  Inserta filas en `detalles_factura` (snapshot de precios)
       │  Vacía el carrito
       │
       ▼
   Respuesta: { factura_id, total }

4. Usuario descarga el PDF
   GET /api/facturas/detalle-factura/:id/pdf
   (Genera PDF on-the-fly con PDFKit y lo envía como stream)
```

---

### Carga Masiva de Productos

```
Admin sube archivo CSV / XLSX / JSON
    │
    ▼
POST /api/productos/carga-masiva
    │  Multer lee el archivo en memoria (buffer)
    │  procesarArchivo() detecta extensión y parsea
    │  Mapea campos al esquema interno
    │  Valida el array completo con Joi
    │  ModelProductos.insertMany() → db.batch() (Turso)
    │
    ▼
Respuesta: { cantidadInsertada }
```

**Formato esperado del archivo:**

| Campo CSV/Excel | Campo interno | Notas |
|---|---|---|
| `nombre_producto` o `nombre` | `nombre_producto` | Alias aceptado |
| `categoria` | `categoria` | Ver categorías válidas |
| `precio` | `precio` | Se convierte a Number |
| `capacidad` | `capacidad` | Se convierte a array de strings |
| `descripcion` | `descripcion` | Opcional |
| `imagen` o `imagen_url` | `imagen_url` | Alias aceptado |
| `condicion` o `estado` | `condicion` | Alias aceptado |

---

### Recuperación de Contraseña

```
POST /api/recuperar-password
    │  Busca usuario por email
    │  Genera código 6 dígitos
    │  Guarda código en `codigo_verificacion`
    │  Envía email con el código
    │
    ▼
Usuario recibe email y envía el código + nueva contraseña

POST /api/reset-password
    │  Hashea la nueva contraseña
    │  UPDATE: password = hash, verificado = 'verdadero', codigo_verificacion = NULL
    │  (todo en una sola query atómica)
    │
    ▼
Contraseña actualizada
```

---

## 6. Seguridad

| Aspecto | Implementación |
|---|---|
| **Contraseñas** | Nunca se almacenan en texto plano. Se hashean con `bcrypt` usando salt 10 |
| **Autenticación** | JWT firmados con `SECRET_KEY` del entorno, expiración de 1 hora |
| **Autorización** | Doble middleware: `verificarToken` (autenticación) + `verificarAdmin` (autorización por rol) |
| **Validación de entrada** | Todos los endpoints usan schemas Joi antes de ejecutar lógica de negocio |
| **SQL Injection** | Todas las queries usan parámetros preparados (`args: [...]`), nunca interpolación directa |
| **CORS** | Configurado explícitamente en `index.js`: solo acepta `localhost:5173` y el dominio de producción |
| **Subida de archivos** | Multer filtra por MIME type. Las imágenes se procesan en memoria (no se escriben al disco) |
| **Borrado de imágenes** | Si la validación falla después de subir a Cloudinary, las imágenes se eliminan como rollback |
| **Variables de entorno** | Todas las credenciales se leen desde `.env` vía `dotenv`. Nunca hardcodeadas (salvo la URL de Turso que es pública) |
| **Rol hardcodeado** | En `ModelStaff.crearStaff` el rol `'admin'` está hardcodeado en el modelo, no en el body de la request |

---

## 7. Asistente Virtual

El chatbot de AirMobile conecta el frontend con un workflow de N8N que usa el modelo Ollama `qwen3:8b`.

### Flujo de una consulta

```
Usuario escribe mensaje en N8nChat
    │
    ▼
useN8nChat.js
    │  Envía POST al webhook de N8N con:
    │  { mensaje, historial_conversacion }
    │
    ▼
N8N Workflow
    │
    ├─► Nodo AI Agent (qwen3:8b vía Ollama)
    │       │  Interpreta la intención del usuario
    │       │  Decide qué tool usar
    │       │
    │       ├─► Tool: "Buscar Producto"
    │       │   Si menciona categoría o modelo específico
    │       │   → GET /api/productos/productos?busqueda=...&categoria=...
    │       │
    │       └─► Tool: "Consultar Catálogo General"
    │           Si pregunta de forma genérica
    │           → GET /api/productos/productos (hasta 50 resultados)
    │
    ▼
Respuesta con productos, precios y links en formato Markdown
    │
    ▼
N8nChat.jsx
    │  react-markdown renderiza la respuesta
    │  Los links [Ver detalles](/producto/ID) navegan dentro de la SPA
```

### Archivos de configuración del agente

| Archivo | Contenido |
|---|---|
| `system_prompt.txt` | Personalidad, reglas de comportamiento, formato de respuesta obligatorio, categorías de productos |
| `tool_busqueda.txt` | Descripción del tool "Buscar Producto": cuándo usarlo, parámetros `busqueda` y `categoria`, valores válidos de categoría |
| `tool_catalogo.txt` | Descripción del tool "Consultar Catálogo General": cuándo usarlo, instrucciones de agrupado y formato de respuesta |

### Formato de respuesta del agente

El agente está instruido para **siempre** incluir el precio con `$` y un link en Markdown usando el `id` del producto devuelto por la base de datos:

```markdown
**iPhone 13 Pro Max** - $850.50
En stock y disponible.
[Ver detalles](/producto/3)
```

El link usa rutas relativas que React Router resuelve internamente sin recargar la página.
