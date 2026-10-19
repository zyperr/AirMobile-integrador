import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function BotonDeseados({ idProducto, onRemover = () => { }, setToastDeseadosVisible }) {

    const [esFavorito, setEsFavorito] = useState(false);

    // Solo necesitamos una instancia de ejecutarPeticion
    const { ejecutarPeticion } = useApi();

    useEffect(() => {
        const verificarDeseado = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // Si no hay token, ni intentamos verificar

            // Tu useApi ya pone los headers y el token por defecto
            const response = await ejecutarPeticion(`lista-deseados/verificar/${idProducto}`, {
                method: 'GET'
            });

            if (response.exito) {
                setEsFavorito(response.data.data === true);
            }
        }

        verificarDeseado();
    }, [idProducto]);

    const toggleDeseo = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('token');

        if (!token) {
            alert("Debes iniciar sesión para agregar productos a tu lista de deseos.");
            return;
        }

        // Guardamos cómo estaba el corazón ANTES del clic
        const estadoAnterior = esFavorito;

        // Optimistic UI: Lo cambiamos visualmente de inmediato
        setEsFavorito(!estadoAnterior);

        if (!estadoAnterior) {
            // Si NO era favorito, lo agregamos
            // useApi detecta que hay un 'body' en formato JSON y arma los headers solo
            const response = await ejecutarPeticion(`lista-deseados/agregar/${idProducto}`, {
                method: 'POST',
                body: JSON.stringify({ productoId: idProducto })
            });

            if (!response.exito) {
                setEsFavorito(estadoAnterior); 
            } else if (setToastDeseadosVisible) {
                // Opcional: Si pasaste la función del toast, lo mostramos
                setToastDeseadosVisible(true);
            }

        } else {
            // Si YA ERA favorito, lo eliminamos
            const response = await ejecutarPeticion(`lista-deseados/eliminar/${idProducto}`, {
                method: 'DELETE',
                body: JSON.stringify({ productoId: idProducto })
            });

            if (!response.exito) {
                setEsFavorito(estadoAnterior); 
            } else {
               

                onRemover(idProducto);
            }
        }
    };

    return (
        <button
            className="btn position-absolute rounded-circle shadow-sm d-flex justify-content-center align-items-center transition-all border-0"
            style={{
                top: "12px",
                left: "12px",
                zIndex: 10,
                width: "36px",
                height: "36px",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(4px)" 
            }}
            onClick={toggleDeseo}
            title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
            <i
                // alterna entre el corazón vacío y el lleno
                className={`bi ${esFavorito ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`}
                style={{ fontSize: "1.1rem", marginTop: "2px" }}
            ></i>
        </button>
    );
}