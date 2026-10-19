# Despliegue de AirMobile (portafolio)

Arquitectura: **Frontend → Vercel**, **API → Render**, **DB → Turso**, **Chat con IA → endpoint del backend + Groq** (en desarrollo se prototipó con n8n + Ollama).

## 1. Base de datos (Turso)
1. `turso db create airmobile` y `turso db tokens create airmobile`.
2. Guardá `TURSO_URL` (libsql://...) y `TURSO_TOKEN`.
3. Cargá datos de ejemplo una vez desde tu PC: con esas variables en `.env`, `npm run dev:seed`.

## 2. API (Render)
1. New → Blueprint → elegí este repo (usa `render.yaml`), o Web Service con build `npm ci --omit=dev` y start `npm start`.
2. Completá las variables (ver `.env.example`). Claves:
   - `FRONTEND_URL` = URL de Vercel (ej. `https://airmobile.vercel.app`)
   - `BACKEND_URL` = URL de Render (ej. `https://airmobile-api.onrender.com`)
   - `MP_ACCESS_TOKEN` = token **de prueba** de Mercado Pago
3. Probá `https://<tu-api>/health` → `{"ok":true}`.
> El plan gratis se duerme tras 15 min sin uso; el primer request tarda ~50 s.

## 3. Frontend (Vercel)
1. Importá el repo. Root directory: raíz del repo (el `vercel.json` ya define build y salida `frontend/dist`).
2. Variable: `VITE_API_URL=https://<tu-api>/api` (el chat usa `VITE_API_URL + /bot/chat` automáticamente).
3. Deploy. Después volvé a Render y confirmá que `FRONTEND_URL` coincide exactamente.

## 4. Mercado Pago
- Usá credenciales de prueba y cuentas de test comprador. Con URLs https públicas, `auto_return` y el webhook (`BACKEND_URL/api/pagos/webhook`) funcionan sin ngrok.

## 5. Chat con IA (Groq)
- El chat de la web llama a `POST /api/bot/chat` del backend, que usa Groq con dos herramientas
  (`consultar_catalogo` y `buscar_producto`) sobre la base de datos real. Código: `backend/src/utils/botIA.js`
  y `chatConIA` en `backend/src/controllers/controllerChatBot.js`.
- Creá una API key gratis en https://console.groq.com y cargala en Render como `GROQ_API_KEY`.
- Opcional: `GROQ_MODEL` para cambiar de modelo (por defecto `openai/gpt-oss-120b`).
- La memoria de conversación vive en RAM: se reinicia cuando Render duerme el servicio.
- Los workflows originales de n8n (chat y bot de emails) se pueden guardar exportados en `n8n/` como referencia.

## 6. Para el portafolio
- Creá un usuario demo y poné credenciales en el README.
- Grabá un video/GIF corto del flujo de compra y del chat (por si el bot o la API están dormidos).
