import { useState } from "react";

const webhookUrl = "http://localhost:5678/webhook/dfff64e4-9189-477f-91c1-61a901a87dd6";

const getSessionData = (usuarioPerfil) => {
    if (usuarioPerfil && usuarioPerfil.id) {
        return {
            sessionId: `auth_${usuarioPerfil.id}`,
            nombreCliente: usuarioPerfil.nombre
        };
    }
    let guestId = localStorage.getItem('airmobile_session');
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem('airmobile_session', guestId);
    }
    return {
        sessionId: `guest_${guestId}`,
        nombreCliente: "Invitado"
    };
};

export const useN8nChat = (usuarioPerfil) => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '¡Hola! 👋 Bienvenido a AirMobile.' },
        { sender: 'bot', text: '¿En qué puedo ayudarte hoy?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (userMessage) => {
        const sessionData = getSessionData(usuarioPerfil);

        const payload = {
            chatInput: userMessage,
            sessionId: sessionData.sessionId,
            nombreCliente: sessionData.nombreCliente,
            // ✅ token solo si está logueado, null si es invitado
            token: localStorage.getItem('token') || null,
            estaLogueado: !!(usuarioPerfil && usuarioPerfil.id)
        };

        if (!userMessage.trim() || isLoading) return;

        setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const contentType = response.headers.get('content-type');
            let botResponseText = '';

            if (contentType && contentType.includes('application/json')) {
                let data = await response.json();
                if (Array.isArray(data) && data.length > 0) data = data[0];
                if (data?.output) botResponseText = data.output;
                else if (data?.response) botResponseText = data.response;
                else if (typeof data === 'string') botResponseText = data;
                else botResponseText = JSON.stringify(data);
            } else {
                botResponseText = await response.text();
            }

            setMessages((prev) => [...prev, { sender: 'bot', text: botResponseText }]);

        } catch (error) {
            console.error('Error al conectar con n8n:', error);
            setMessages((prev) => [...prev, {
                sender: 'bot',
                text: 'Lo siento, hubo un problema al conectar. Intenta nuevamente.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return { messages, isLoading, sendMessage };
};