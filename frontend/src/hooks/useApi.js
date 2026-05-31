import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// 1. VARIABLE GLOBAL (Fuera del hook)
// Actúa como un semáforo para que todas las peticiones concurrentes lo vean
let promesaRenovacion = null; 

export const useApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const urlBase = "http://localhost:3000/api/";

    const { refreshToken, login, logout,setUsuario } = useAuth();

    const ejecutarPeticion = async (endpoint, options = {}, reintentando = false) => {
        if (!reintentando) setIsLoading(true);
        setError(null);

        const URL = urlBase.concat(endpoint);
        
        try {
            const esFormData = options.body instanceof FormData;
            const tokenActual = options.headers?.Authorization
                ? options.headers.Authorization
                : `Bearer ${localStorage.getItem('token')}`;
                
            const headersBase = esFormData 
                ? { 'Authorization': tokenActual } 
                : { 'Content-Type': 'application/json', 'Authorization': tokenActual };

            console.log(`Reintentando: ${reintentando} | Token enviado a ${endpoint}:`, tokenActual.substring(0, 25) + '...');
            
            const response = await fetch(URL, {
                headers: {
                    ...headersBase,
                    ...options.headers,
                },
                ...options
            });
            
            const result = await response.json();

            // --- INICIO LÓGICA INTERCEPTOR ---
            if (response.status === 401 && !reintentando && refreshToken) {
                console.warn(`Access Token expirado en petición a ${endpoint}.`);

                // 2. Si no hay nadie buscando la llave, YO voy a buscarla
                if (!promesaRenovacion) {
                    console.log("Soy el primero. Voy a pedir el Refresh Token...");
                    promesaRenovacion = fetch(`${urlBase}usuarios/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: refreshToken })
                    })
                    .then(async (res) => {
                        if (!res.ok) throw new Error("La sesión no pudo ser renovada");
                        return await res.json();
                    })
                    .finally(() => {
                        // 4. Cuando termino (ya sea con éxito o fallo), vacío la sala de espera
                        promesaRenovacion = null; 
                    });
                } else {
                    console.log("Alguien más ya está pidiendo la llave. Me quedo esperando...");
                }

                try {
                    // 3. TODOS ESPERAN ACÁ. 
                    // El primero espera a que termine su propio fetch. 
                    // Los demás esperan a que el primero termine.
                    const refreshResult = await promesaRenovacion;

                    // Actualizamos el contexto global con las llaves nuevas
                    login(refreshResult.token, refreshResult.refreshToken);
                    setUsuario(refreshResult.data)
                    console.log(`Llave recibida. Reintentando ${endpoint}...`);

                    const nuevasOptions = {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${refreshResult.token}`
                        }
                    };
                    return await ejecutarPeticion(endpoint, nuevasOptions, true);

                } catch (error) {
                    console.error("Fallo definitivo en la llave maestra. Expulsando usuario.");
                    logout();
                    throw new Error("Tu sesión expiró por seguridad. Por favor, iniciá sesión nuevamente.");
                }
            }
            // --- FIN LÓGICA INTERCEPTOR ---

            if (!response.ok) {
                throw new Error(result.message || "Ocurrió un error inesperado");
            }

            setIsLoading(false);
            return { exito: true, data: result };
            
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "Error de conexión con el servidor.");
            return { exito: false, error: err.message };
        }
    }
    return { ejecutarPeticion, isLoading, error, setError };
}