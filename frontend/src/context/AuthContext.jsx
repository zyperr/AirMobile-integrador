// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

// 1. Creamos el Contexto (el megáfono)
const AuthContext = createContext();
const URL_PERFIL = "http://localhost:3000/api/usuarios/mi-perfil";
const URL_LOGOUT = "http://localhost:3000/api/usuarios/logout";
// 2. Creamos el Proveedor (el componente que guarda el estado)
export const AuthProvider = ({ children }) => {
    // Inicializamos el estado leyendo una sola vez el localStorage
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [usuario, setUsuario] = useState(null);


    // Usamos useEffect para reaccionar si el token cambia (opcional pero buena práctica)
    useEffect(() => {
        const obtenerUsuario = async () => {
            const response = await fetch(URL_PERFIL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const result = await response.json();
            setUsuario(result.data)
        }
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
        if (!usuario) {
            obtenerUsuario()
        }
    }, [token, usuario]);

    // Función para iniciar sesión (se usa en la página de Login)
    const login = (nuevoToken, nuevoRefreshToken) => {
        localStorage.setItem('token', nuevoToken);
        localStorage.setItem('refreshToken', nuevoRefreshToken);

        setToken(nuevoToken);
        setRefreshToken(nuevoRefreshToken);
    };

    // Función para cerrar sesión (se usa en el botón del Perfil)
    const logout = async () => {
        // 1. Agarramos el token antes de borrarlo
        const tokenParaRevocar = localStorage.getItem('refreshToken');

        // 2. Si hay un token, le avisamos al backend que lo queme
        if (tokenParaRevocar) {
            try {
                await fetch(URL_LOGOUT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken: tokenParaRevocar })
                });
                console.log("Token revocado en el servidor exitosamente.");
            } catch (error) {
                // Si el servidor está caído, mostramos el error pero IGUAL cerramos la sesión local
                console.error("No se pudo contactar al servidor para revocar el token", error);
            }
        }

        // 3. Limpieza local (Esto se hace SIEMPRE, falle o no el backend)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        setToken(null);
        setRefreshToken(null);
        setUsuario(null)
        window.location = "/"
    };

    // Determinamos si el usuario está autenticado basándonos en si hay token
    const estaAutenticado = !!token; // Convierte el string en booleano (true si hay texto, false si es null)

    // Definimos qué datos "emitirá" este contexto
    const datosPorEmitir = {
        token,
        refreshToken,
        estaAutenticado,
        usuario,
        setUsuario,
        login,
        logout
    };

    return (
        // "Proveemos" los datos a todos los componentes hijos
        <AuthContext.Provider value={datosPorEmitir}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Creamos un Hook personalizado para usar esto fácilmente (useAuth)
export const useAuth = () => {
    return useContext(AuthContext);
};