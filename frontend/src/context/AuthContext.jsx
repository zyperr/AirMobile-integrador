// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

// 1. Creamos el Contexto (el megáfono)
const AuthContext = createContext();

// 2. Creamos el Proveedor (el componente que guarda el estado)
export const AuthProvider = ({ children }) => {
    // Inicializamos el estado leyendo una sola vez el localStorage
    const [token, setToken] = useState(localStorage.getItem('token'));
    // Opcional: Podrías guardar también datos básicos del usuario aquí
    // const [usuario, setUsuario] = useState(null); 

    // Usamos useEffect para reaccionar si el token cambia (opcional pero buena práctica)
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // Función para iniciar sesión (se usa en la página de Login)
    const login = (nuevoToken) => {
        setToken(nuevoToken); // Esto actualiza el estado GLOBAL instantáneamente
        // window.location.href = '/perfil'; // Opcional: redirigir aquí o en el componente Login
    };

    // Función para cerrar sesión (se usa en el botón del Perfil)
    const logout = () => {
        setToken(null); // Esto borra el estado GLOBAL instantáneamente
        //redireccionar a la pagina principal
        window.location.href = '/';
    };

    // Determinamos si el usuario está autenticado basándonos en si hay token
    const estaAutenticado = !!token; // Convierte el string en booleano (true si hay texto, false si es null)

    // Definimos qué datos "emitirá" este contexto
    const datosPorEmitir = {
        token,
        estaAutenticado,
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