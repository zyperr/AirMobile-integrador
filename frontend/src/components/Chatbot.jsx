import React, { useState } from "react";
const Chatbot = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        setLoading(true);

        // --- CONFIGURACIÓN PARA OPENAI ---
        // const url = "https://api.openai.com/v1/chat/completions";
        // const headers = {
        // "Content-Type": "application/json",
        // Authorization: `Bearer
        //${ process.env.REACT_APP_OPENAI_API_KEY } `
        // };
        // --- CONFIGURACIÓN PARA OLLAMA (LOCAL) ---
        const url = "http://localhost:11434/api/chat";
        const headers = { "Content-Type": "application/json" };
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    model: "llama3", // Cambiar a "gpt-3.5-turbo" si usas OpenAI
                    messages: [
                        { role: "system", content: "sos un asistente de una tienda de ropa y tenes que contestar de manera formar ademas tenemos los siguintes productos disponibles 1 remera roja 2 medias azules 5 pantalos de jeans tambien si preguntan por otro producto tenes que contestar que en breve estara a la venta" },
                        { role: "user", content: input },
                    ],
                    stream: false, // Desactivar streaming para simplificar respuesta
                }),
            });
            const data = await res.json();
            // Para OpenAI usar: data.choices[0].message.content
            // Para Ollama usar: data.message.content
            setResponse(data.message?.content ||
                data.message.content);
        } catch (error) {
            setResponse("Error de conexión. ¿Está la API activa?");
        }
        setLoading(false);

    };

    const handleSendLimpiar = () => {
        setResponse("");
        setInput("");
    }


    
    return (
        <div style={{
            padding: '20px', maxWidth: '500px', margin: 'auto'
        }}>
            <h2>Asistente de Tienda</h2>
            <textarea
                style={{
                    width: '100%', borderRadius: '8px', padding: '10px'
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="¿En qué puedo ayudarte?"
            />
            <button
                onClick={handleSend}
                disabled={loading}
                style={{
                    marginTop: '10px', backgroundColor: '#007bff', color:
                        'white', padding: '10px 20px', border: 'none', borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {loading ? "Pensando..." : "Enviar consulta"}
            </button>

                
            <button
                onClick={handleSendLimpiar}
                style={{
                    marginTop: '10px', backgroundColor: '#007bff', color:
                        'white', padding: '10px 20px', border: 'none', borderRadius: '5px',
                    cursor: 'pointer', marginLeft: '10px'
                }}
            >
                Limpiar Chat 
            </button>

            {response && (
                <div style={{
                    marginTop: '20px', padding: '15px',
                    backgroundColor: '#f4f4f4', borderRadius: '8px'
                }}>
                    <strong>Respuesta:</strong>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
};
export default Chatbot;