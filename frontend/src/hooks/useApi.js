import { useState } from "react";


export const useApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const urlBase = "http://localhost:3000/api/"

    const ejecutarPeticion = async (endpoint, options = {}) => {
        setIsLoading(true)
        setError(null)
        const URL = urlBase.concat(endpoint)
        console.log(URL)
        try {
            const response = await fetch(URL, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options
            })
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Ocurrio un error inesperado");
            }

            setIsLoading(false)
            return { exito: true, data: result }
        } catch (err) {
            setIsLoading(false);
            setError(err.message || "Error de conexión con el servidor.");
            // Retornamos el fallo para que el componente no intente redirigir
            return { exito: false, error: err.message };
        }
    }
    return { ejecutarPeticion, isLoading, error, setError };
}