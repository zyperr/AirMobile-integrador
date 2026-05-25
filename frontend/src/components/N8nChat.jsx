import { useState, useRef, useEffect } from 'react';
import '../style/N8nChat.css';

export const N8nChat = () => {

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! 👋 Bienvenido a AirMobile.' },
    { sender: 'bot', text: '¿En qué puedo ayudarte hoy?' }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isLoading]);

  const handleSend = async (e) => {

    e.preventDefault();

    // Evita enviar vacío o múltiples requests
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // Limpiar input
    setInput('');

    // Agregar mensaje usuario
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userMessage
      }
    ]);

    setIsLoading(true);

    try {

      // Request a n8n
      const response = await fetch(
        'http://localhost:5678/webhook/e8e1169f-0c39-40ea-9dbe-357936cc69c4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatInput: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const contentType = response.headers.get('content-type');

      let botResponseText = '';

      // Si responde JSON
      if (contentType && contentType.includes('application/json')) {

        let data = await response.json();

        // Si viene array
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }

        // Extraer texto
        if (data?.output) {

          botResponseText = data.output;

        } else if (data?.response) {

          botResponseText = data.response;

        } else if (typeof data === 'string') {

          botResponseText = data;

        } else {

          botResponseText = JSON.stringify(data);

        }

      } else {

        // Texto plano
        botResponseText = await response.text();

      }

      // Agregar respuesta bot
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponseText
        }
      ]);

    } catch (error) {

      console.error('Error al conectar con n8n:', error);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Lo siento, hubo un problema al conectar con el servicio técnico. Intenta nuevamente.'
        }
      ]);

    } finally {

      setIsLoading(false);

    }
  };

  return (
    <div className="airmobile-chat-container">

      {/* BOTÓN FLOTANTE */}
      <button
        className={`btn btn-primary rounded-circle shadow-lg airmobile-chat-btn ${isOpen ? 'open' : ''
          }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat de soporte"
      >

        {isOpen ? (
          <i className="bi bi-x"></i>
        ) : (
          <i className="bi bi-chat"></i>
        )}

      </button>

      {/* VENTANA CHAT */}
      {isOpen && (

        <div className="card shadow-lg border-0 airmobile-chat-window animate-fade-in">

          {/* HEADER */}
          <div className="card-header bg-primary text-white p-3 d-flex align-items-center justify-content-between">

            <div>
              <h6 className="m-0 fw-bold">
                Soporte AirMobile
              </h6>

              <small>
                Asistente de IA en línea
              </small>
            </div>

            <span
              className="badge bg-success rounded-pill px-2 py-1"
              style={{ fontSize: '10px' }}
            >
              Online
            </span>

          </div>

          {/* BODY */}
          <div className="card-body overflow-auto p-3 airmobile-chat-body">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`d-flex mb-2 ${msg.sender === 'user'
                    ? 'justify-content-end'
                    : 'justify-content-start'
                  }`}
              >

                <div
                  className={`p-2 px-3 rounded-3 msg-bubble ${msg.sender === 'user'
                      ? 'bg-primary text-white user-bubble'
                      : 'bg-light text-dark bot-bubble'
                    }`}
                >
                  {msg.text}
                </div>

              </div>

            ))}

            {/* Loading */}
            {isLoading && (

              <div className="d-flex justify-content-start mb-2">

                <div className="p-2 px-3 rounded-3 bg-light text-muted bot-bubble d-flex align-items-center">

                  <div
                    className="spinner-grow spinner-grow-sm text-secondary me-2"
                    role="status"
                  ></div>

                  <small>
                    Escribiendo...
                  </small>

                </div>

              </div>

            )}

            <div ref={chatEndRef} />

          </div>

          {/* FOOTER */}
          <div className="card-footer bg-white border-top p-2">

            <form
              onSubmit={handleSend}
              className="d-flex gap-2"
            >

              <input
                type="text"
                className="form-control form-control-sm border-2 rounded-pill px-3"
                placeholder="Pregunta por stock, precios..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />

              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-circle "
                disabled={isLoading || !input.trim()}
              >

               <i className="bi bi-send"></i>

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};