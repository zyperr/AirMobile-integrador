// URLs configurables por entorno (Vite expone solo variables que empiezan con VITE_)
// En local se usan los valores por defecto; en producción se definen en el panel del hosting.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

// Chat con IA: por defecto usa el endpoint del backend (Groq).
// Para volver a probar el workflow local de n8n, definí VITE_CHAT_URL con la URL del webhook.
export const CHAT_URL = import.meta.env.VITE_CHAT_URL || `${API_URL}/bot/chat`;
