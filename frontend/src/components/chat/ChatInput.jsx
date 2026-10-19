import { useState } from 'react';


export const ChatInput = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        onSendMessage(input.trim());
        setInput(''); // Limpiamos el input después de enviar
    };

    return (
        <div className="card-footer bg-white border-top p-2">
            <form onSubmit={handleSend} className="d-flex gap-2">
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
                    className="btn btn-primary btn-sm rounded-circle"
                    disabled={isLoading || !input.trim()}
                >
                    <i className="bi bi-send"></i>
                </button>
            </form>
        </div>
    );
};