import { createContext, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useApi } from "../hooks/useApi";

export const CarritoContext = createContext();

export function CartProvider({ children }) {
    const { estaAutenticado } = useAuth();
    const { ejecutarPeticion, isLoading } = useApi();

    const [cartItems, setCartItems] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);





    const procesarPago = async () => {
        setIsProcessing(true);

        try {
            const response = await ejecutarPeticion('pagos/crear-preferencia', {
                method: 'POST',
                body: JSON.stringify({ items: cartItems })
            });

            // --- AQUÍ ESTÁ EL CAMBIO ---
            console.log("Respuesta de la API:", response); 
            
            if (response.exito && response.data?.init_point) {
                window.location.href = response.data.init_point;
            } else {
                // Si 'response' existe pero 'exito' es false, aquí veremos el error real
                console.error("Error detallado del servidor:", response); 
                alert(`Error al pagar: ${response.message || "Revisa la consola del servidor"}`);
            }

        } catch (error) {
            console.error("Error fatal en el fetch:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── 1. CARGAR CARRITO ────────────────────────────────────────────────────
    const cargarCarrito = async () => {
        if (!estaAutenticado) {
            setCartItems([]);
            return;
        }

        const response = await ejecutarPeticion("carrito", { method: "GET" });

        if (response.exito && response.data?.data) {
            const carritoFormateado = response.data.data.map(item => {
                let imagenParseada = null;
                try {
                    imagenParseada = JSON.parse(item.imagen_url)[0];
                } catch {
                    imagenParseada = item.imagen_url;
                }
                return {
                    id: item.producto_id,
                    carritoId: item.carrito_id,
                    nombre_producto: item.nombre_producto,
                    // FIX 1: se usa "cantidad" de forma consistente en todo el contexto
                    cantidad: Number(item.cantidad),
                    precio: Number(item.precio),
                    capacidad: item.capacidad,
                    imagen: imagenParseada,
                };
            });
            setCartItems(carritoFormateado);
        } else {
            setCartItems([]);
        }
    };

    // ─── 2. ESCUCHAR CAMBIOS DE SESIÓN ────────────────────────────────────────
    useEffect(() => {
        if (estaAutenticado) {
            cargarCarrito();
        } else {
            setCartItems([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estaAutenticado]);

    // ── 3. VACIAR CARRITO ─────────────────────────────────────────────────────
    const vaciarCarrito = async () => {
        // Guardamos el respaldo por si el servidor falla
        const carritoOriginal = [...cartItems];

        // ¡Actualización optimista! Vaciamos la pantalla al instante
        setCartItems([]);

        // Le avisamos al backend
        const response = await ejecutarPeticion(`carrito/vaciar-carrito`, {
            method: "DELETE"
        });

        // Si falló por algún motivo (ej. se cortó internet), deshacemos el cambio
        if (!response.exito) {
            console.error("Error al vaciar el carrito. Revirtiendo...");
            setCartItems(carritoOriginal);
        }
    };

    // ─── 4. AGREGAR PRODUCTO ─────────────────────────────────────────────────
    // ─── 4. AGREGAR PRODUCTO ─────────────────────────────────────────────────
    // NUEVO: Agregamos el parámetro "capacidadSeleccionada" (por defecto null)
    const agregarProducto = async (idProducto, capacidadSeleccionada = null) => {
        setLoadingId(idProducto);

        const productoExistente = cartItems.find(
            item => item.id === idProducto && item.capacidad === capacidadSeleccionada
        );
        const carritoOriginal = [...cartItems];

        if (productoExistente) {
            setCartItems(prev => prev.map(item =>
                item.id === idProducto && item.capacidad === capacidadSeleccionada
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
            setToastVisible(true);
        }

        const response = await ejecutarPeticion(`carrito/agregar-carrito/${idProducto}`, {
            method: "POST",
            body: JSON.stringify({ 
                cantidad: 1,
                capacidad: capacidadSeleccionada 
            }),
        });

        if (response.exito) {
            if (!productoExistente) {
                const resProducto = await ejecutarPeticion(`productos/${idProducto}`, {
                    method: "GET",
                });
                if (resProducto.exito) {
                    const p = resProducto.data.data;
                    let imagen = null;
                    try {
                        imagen = Array.isArray(p.imagen_url)
                            ? p.imagen_url[0]
                            : JSON.parse(p.imagen_url)[0];
                    } catch {
                        imagen = p.imagen_url;
                    }

                    // ─── NUEVO: Calcular el precio real con el costo extra en el Context ───
                    let listaCaps = [];
                    try {
                        listaCaps = typeof p.capacidad === 'string' ? JSON.parse(p.capacidad) : p.capacidad;
                    } catch {
                        listaCaps = p.capacidad || [];
                    }
                    
                    const idx = listaCaps.indexOf(capacidadSeleccionada);
                    let extra = 0;
                    if (idx === 1) extra = 100;
                    if (idx === 2) extra = 250;
                    if (idx === 3) extra = 400;

                    setCartItems(prev => [...prev, {
                        id: idProducto,
                        nombre_producto: p.nombre_producto,
                        cantidad: 1,
                        precio: Number(p.precio) + extra, // <-- ¡Guardamos el precio sumado!
                        capacidad: capacidadSeleccionada, 
                        imagen,
                    }]);
                    setToastVisible(true);
                } else {
                    await cargarCarrito();
                }
            }
        } else {
            console.error("Error al agregar al carrito. Revirtiendo...");
            setCartItems(carritoOriginal);
            alert(response.message || "Error al agregar al carrito");
        }

        setLoadingId(null);
    };
    // ─── 5. AUMENTAR CANTIDAD ────────────────────────────────────────────────
    const increaseQuantity = async (idProducto, capacidad) => {
        setLoadingId(idProducto);
        const carritoOriginal = [...cartItems];

        // Validamos que coincida el ID y la CAPACIDAD
        setCartItems(prev => prev.map(item =>
            item.id === idProducto && item.capacidad === capacidad
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
        ));

        // Le enviamos la capacidad al backend
        const response = await ejecutarPeticion(`carrito/agregar-carrito/${idProducto}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: 1, capacidad: capacidad }),
        });

        if (!response.exito) {
            console.error("Falló al aumentar cantidad, revirtiendo...");
            setCartItems(carritoOriginal);
        }

        setLoadingId(null);
    };

    // ─── 6. DISMINUIR CANTIDAD ───────────────────────────────────────────────
    const decreaseQuantity = async (idProducto, capacidad) => {
        setLoadingId(idProducto);
        const carritoOriginal = [...cartItems];

        setCartItems(prev => prev.map(item => {
            if (item.id === idProducto && item.capacidad === capacidad) {
                return { ...item, cantidad: Math.max(1, item.cantidad - 1) };
            }
            return item;
        }));

        // Para DELETE, enviamos la capacidad en el body para que el backend sepa cuál restar
        const response = await ejecutarPeticion(`carrito/eliminar-carrito/${idProducto}`, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ capacidad: capacidad })
        });

        if (!response.exito) {
            setCartItems(carritoOriginal);
        }

        setLoadingId(null);
    };

    // ─── 7. ELIMINAR PRODUCTO ────────────────────────────────────────────────
    const removeFromCart = async (idProducto, capacidad) => {
        setLoadingId(idProducto);
        const carritoOriginal = [...cartItems];

        // Filtramos para ELIMINAR SOLO el que coincida en ID y en Capacidad
        setCartItems(prev => prev.filter(item => !(item.id === idProducto && item.capacidad === capacidad)));

        const response = await ejecutarPeticion(`carrito/eliminar-producto-completo/${idProducto}`, {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ capacidad: capacidad })
        });

        if (!response.exito) {
            setCartItems(carritoOriginal);
        }

        setLoadingId(null);
    };


    // ─── 9. CÁLCULOS DERIVADOS ───────────────────────────────────────────────
    // FIX 2: "cantidad" en lugar de "quantity"
    const cartCount = cartItems.reduce((total, item) => total + item.cantidad, 0);
    const subtotal = cartItems.reduce((total, item) => total + item.precio * item.cantidad, 0);

    return (
        <CarritoContext.Provider
            value={{
                loadingId,
                isLoading,
                cartItems,
                cartCount,
                subtotal,
                isProcessing,
                toastVisible,
                setToastVisible,
                procesarPago,
                cargarCarrito,
                agregarProducto,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                vaciarCarrito,
            }}
        >
            {children}
        </CarritoContext.Provider>
    );
}

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (context === undefined) {
        throw new Error("useCarrito debe usarse dentro de un CartProvider");
    }
    return context;
};