import { useState, useRef, useEffect } from 'react';
import { useN8nChat } from '../hooks/useN8nChat'; // Ajusta la ruta según tu estructura
import { ChatInput } from './ChatInput';
import '../style/N8nChat.css';

export const N8nChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage } = useN8nChat();
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  return (
    <div className="airmobile-chat-container">
      {/* BOTÓN FLOTANTE */}
      <button
        className={`btn btn-primary rounded-circle shadow-lg airmobile-chat-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir chat de soporte"
      >
        <i className={`bi ${isOpen ? 'bi-x' : 'bi-chat'}`}></i>
      </button>

      {/* VENTANA CHAT */}
      {isOpen && (
        <div className="card shadow-lg border-0 airmobile-chat-window animate-fade-in">
          {/* HEADER */}
          <div className="card-header bg-primary text-white p-3 d-flex align-items-center justify-content-between">
            <div>
              <h6 className="m-0 fw-bold">Soporte AirMobile</h6>
              <small>Asistente de IA en línea</small>
            </div>
            <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>
              Online
            </span>
          </div>

          {/* BODY */}
          <div className="card-body overflow-auto p-3 airmobile-chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-2 px-3 rounded-3 msg-bubble ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white user-bubble'
                      : 'bg-light text-dark bot-bubble text-align-left'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="d-flex justify-content-start mb-2">
                <div className="p-2 px-3 rounded-3 bg-light text-muted bot-bubble d-flex align-items-center">
                  <div className="spinner-grow spinner-grow-sm text-secondary me-2" role="status"></div>
                  <small>Escribiendo...</small>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* FOOTER - Componente extraído */}
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};