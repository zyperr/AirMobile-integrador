import { useState, useRef, useEffect } from 'react';
import '../style/N8nChat.css'; // Archivo que crearemos en el paso 2

export const N8nChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! 👋 Bienvenido a AirMobile.' },
    { sender: 'bot', text: '¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scrollear al último mensaje recibido
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    // 1. Agregar el mensaje del usuario a la pantalla
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // 2. Conexión directa con tu Webhook de n8n usando la IP local estable
      const response = await fetch('http://localhost:5678/webhook-test/e8e1169f-0c39-40ea-9dbe-357936cc69c4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userMessage, // Formato estándar que espera n8n
        }),
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

            // 2. Procesamos el JSON que viene de n8n
        const data = await response.json();
        
        // ==========================================================================
        // LA SOLUCIÓN: Extraemos SOLO la propiedad de texto (habitualmente es 'output')
        // ==========================================================================
        let botResponseText = "";
        
        if (data && data.output) {
          botResponseText = data.output; // <-- Extrae solo el string limpio sin las llaves {}
        } else if (typeof data === 'string') {
          botResponseText = data;
        } else {
          // Si tu n8n devuelve otra variable (ej: data.response), la mapeamos acá:
          botResponseText = data.response || JSON.stringify(data);
        }

  // 3. Guardamos solo el texto en el estado de los mensajes
  setMessages((prev) => [...prev, { sender: 'bot', text: botResponseText }]);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        // Ajusta 'data.output' o 'data.response' según la estructura de tu n8n
        botResponseText = data.output || data.response || JSON.stringify(data);
      } else {
        botResponseText = await response.text();
      }

      // 4. Agregar la respuesta del bot a la pantalla
      setMessages((prev) => [...prev, { sender: 'bot', text: botResponseText }]);

    } catch (error) {
      console.error('Error al conectar con n8n:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Lo siento, hubo un problema al conectar con el servicio técnico. Por favor, intenta de nuevo.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="airmobile-chat-container">
      {/* BOTÓN FLOTANTE CIRCULAR */}
      <button 
        className={`btn btn-primary rounded-circle shadow-lg airmobile-chat-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat de soporte"
      >
        {isOpen ? (
          // Icono X de Bootstrap Icons o SVG nativo
          <i class="bi bi-x"></i>
        ) : (
          // Icono Mensaje/Chat
          <i class="bi bi-chat"></i>
        )}
      </button>

      {/* INTERFAZ DE LA MINI PESTAÑA / VENTANA DE CHAT */}
      {isOpen && (
        <div className="card shadow-lg border-0 airmobile-chat-window animate-fade-in">
          {/* Cabecera Premium estilo Apple */}
          <div className="card-header bg-primary text-white p-3 d-flex align-items-center justify-content-between">
            <div>
              <h6 className="m-0 fw-bold tracking-tight">Soporte AirMobile</h6>
              <small className="ms-2">Asistente de IA en línea</small>
            </div>
            <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>Online</span>
          </div>

          {/* Cuerpo del chat (Mensajes) */}
          <div className="card-body overflow-auto p-3 airmobile-chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`p-2.5 px-3 rounded-3 msg-bubble ${msg.sender === 'user' ? 'bg-primary text-white user-bubble' : 'bg-light text-dark bot-bubble'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Animación de carga/pensando */}
            {isLoading && (
              <div className="d-flex justify-content-start mb-2">
                <div className="p-2.5 px-3 rounded-3 bg-light text-muted bot-bubble d-flex align-items-center">
                  <div className="spinner-grow spinner-grow-sm text-secondary me-1" role="status"></div>
                  <small>Escribiendo...</small>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Formulario de entrada de texto */}
          <div className="card-footer bg-white border-top p-2">
            <form onSubmit={handleSend} className="d-flex gap-1">
              <input
                type="text"
                className="form-control form-control-sm border-2 rounded-pill px-3"
                placeholder="Pregunta por stock, precios..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="btn btn-primary btn-sm rounded-circle px-2.5" disabled={isLoading || !input.trim()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};