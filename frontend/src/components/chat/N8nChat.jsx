import { useState, useRef, useEffect } from 'react';
import { useN8nChat } from '../../hooks/useN8nChat'; // Ajusta la ruta según tu estructura
import { ChatInput } from '../chat/ChatInput';
import ReactMarkdown from 'react-markdown';
import '../../style/N8nChat.css';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

// 1. COMPONENTES MARKDOWN: Para estilizar el catálogo general y los textos del bot
const MarkdownComponents = {
  h3: ({ node, ...props }) => (
    <h6 className="bg-primary bg-opacity-10 text-primary p-2 px-3 rounded-3 mt-3 mb-2 fw-bold d-flex align-items-center" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-group list-group-flush shadow-sm rounded-4 mb-3 border overflow-hidden" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="list-group-item list-group-item-action bg-white text-dark py-2 px-3" style={{ fontSize: '0.9rem', cursor: 'pointer' }} {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="text-dark fw-bold me-1" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-2" style={{ fontSize: '0.95rem' }} {...props} />
  ),


  a: ({ node, href, children, ...props }) => (
    <a
      href={href}
      className="btn btn-primary btn-sm w-100 rounded-pill fw-bold mt-2 shadow-sm d-block text-center"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      <i className="bi bi-cart-check me-1"></i> {children}
    </a>
  )
};


export const N8nChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  const { token, estaAutenticado } = useAuth();
  const { ejecutarPeticion } = useApi();

  // 1. Declaramos el perfil primero
  const [usuarioPerfil, setUsuarioPerfil] = useState(null);
  
  // 2. Le pasamos el perfil a nuestro hook
  const { messages, isLoading, sendMessage } = useN8nChat(usuarioPerfil);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (estaAutenticado && token) {
        const respuesta = await ejecutarPeticion('usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (respuesta.exito) {
          setUsuarioPerfil(respuesta?.data?.data);
        }
      } else {
        setUsuarioPerfil(null);
      }
    };

    cargarPerfil();
  }, [estaAutenticado, token]);

  // Auto scroll para que el chat baje siempre al último mensaje
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  return (
    <div className="airmobile-chat-container text-start">
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
        <div className="card shadow-lg border-0 airmobile-chat-window animate-fade-in rounded-4 overflow-hidden">
          {/* HEADER */}
          <div className="card-header bg-primary text-white p-3 d-flex align-items-center justify-content-between border-0 ">
            <div>
              <h6 className="m-0 fw-bold">
                Soporte AirMobile {usuarioPerfil ? `- Hola, ${usuarioPerfil.nombre}` : ''}
              </h6>
              <small className="opacity-75">Asistente de IA en línea</small>
            </div>
            <span className="badge bg-success bg-opacity-75 rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>
              Online
            </span>
          </div>

          {/* BODY */}
          <div className="card-body overflow-auto p-3 airmobile-chat-body" style={{ backgroundColor: '#f0f2f5' }}>
            {messages.map((msg, index) => {

              // Variables para nuestra lógica interceptora
              const isBot = msg.sender === 'bot';
              const textoBot = msg.text || '';

              // Heurística: ¿Parece un producto específico con precio?
              const esCatalogo = textoBot.includes('###');

              // La tarjeta individual SOLO se activa si NO es un catálogo
              const pareceProducto = isBot && !esCatalogo && textoBot.includes('$') && (textoBot.toLowerCase().includes('precio') || textoBot.toLowerCase().includes('stock') || textoBot.toLowerCase().includes('disponible'));
              return (
                <div
                  key={index}
                  className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div
                    className={`p-3 rounded-4 shadow-sm markdown-container ${msg.sender === 'user'
                      ? 'bg-primary text-white user-bubble rounded-bottom-right-0'
                      : 'bg-white text-dark bot-bubble rounded-bottom-left-0'
                      }`}
                    style={{ maxWidth: '85%' }}
                  >
                    {isBot ? (
                      pareceProducto ? (
                        /* TARJETA DE PRODUCTO HEURÍSTICA */
                        <div className="card border-0 rounded-3 my-1" style={{ width: '100%', maxWidth: '300px' }}>
                          <div className="bg-primary bg-opacity-10 text-center py-4 border-bottom rounded-top">
                            <i className="bi bi-phone text-primary" style={{ fontSize: '3.5rem' }}></i>
                          </div>

                          <div className="card-body bg-light text-start p-3">
                            <div className="markdown-product-details text-dark" style={{ fontSize: '0.9rem' }}>
                              <ReactMarkdown components={MarkdownComponents}>
                                {textoBot}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* MENSAJE ESTÁNDAR / CATÁLOGO GENERAL */
                        <ReactMarkdown components={MarkdownComponents}>
                          {textoBot}
                        </ReactMarkdown>
                      )
                    ) : (
                      /* MENSAJE DEL USUARIO */
                      textoBot
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-3 rounded-4 bg-white text-muted shadow-sm bot-bubble rounded-bottom-left-0 d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  <small>Escribiendo...</small>
                </div>
              </div>
            )}
            {/* Ancla para el autoscroll */}
            <div ref={chatEndRef} />
          </div>

          {/* FOOTER */}
          <div className="bg-white p-2 border-top">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};