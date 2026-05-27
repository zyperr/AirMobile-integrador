import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function BotonDeseados({ idProducto, onRemover = () => { } }) {


    const [esFavorito, setEsFavorito] = useState(false);

    const { ejecutarPeticion } = useApi();

    const { ejecutarPeticion: verificarProductoEnDeseos } = useApi();

    useEffect(() => {
        const verificarDeseado = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // Si no hay token, ni siquiera intentamos verificar

            const response = await verificarProductoEnDeseos(`lista-deseados/verificar/${idProducto}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.exito) {
                // ¡Aquí está la corrección! Agregamos .data.data
                setEsFavorito(response.data.data === true);
                console.log(`Producto ${idProducto} en lista de deseos:`, response.data.data);
            }
        }

        verificarDeseado();
    }, [idProducto])

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

        try {
            if (!estadoAnterior) {
                // Si NO era favorito, lo agregamos
                const response = await ejecutarPeticion(`lista-deseados/agregar/${idProducto}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productoId: idProducto })
                });

                if (!response.exito) {
                    console.error("Error al agregar:", response.message);
                    setEsFavorito(estadoAnterior); // Revertimos al estado original
                }
            } else {
                // Si YA ERA favorito, lo eliminamos
                const response = await ejecutarPeticion(`lista-deseados/eliminar/${idProducto}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productoId: idProducto })
                });

                if (!response.exito) {
                    console.error("Error al eliminar:", response.message);
                    setEsFavorito(estadoAnterior); // Revertimos al estado original
                } else {
                    // ¡AQUÍ ESTÁ LA MAGIA! Si se borró con éxito en el backend, 
                    // ejecutamos la función para borrarlo de la pantalla
                    onRemover(idProducto);
                }
            }
        } catch (error) {
            console.error("Error de conexión al actualizar favoritos", error);
            // Revertimos en caso de que se caiga el internet o el servidor
            setEsFavorito(estadoAnterior);
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
                backdropFilter: "blur(4px)" // Efecto cristal
            }}
            onClick={toggleDeseo}
            title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
            <i
                // Aquí está la magia visual: alterna entre el corazón vacío y el lleno
                className={`bi ${esFavorito ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`}
                style={{ fontSize: "1.1rem", marginTop: "2px" }}
            ></i>
        </button>
    );
}