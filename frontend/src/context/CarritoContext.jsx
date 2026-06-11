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


            if (response.exito && response.data?.init_point) {
                // Redirigimos al usuario a Mercado Pago
                window.location.href = response.data.init_point;
            } else {
                console.error("Error al generar el pago", response.message || "Error desconocido");
                // Mostrar notificación al usuario
                // setToastVisible(true);
            }

        } catch (error) {
            console.error("Error al procesar el pago:", error);
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
    const agregarProducto = async (idProducto) => {
        setLoadingId(idProducto);

        const productoExistente = cartItems.find(item => item.id === idProducto);
        const carritoOriginal = [...cartItems];


        if (productoExistente) {
            setCartItems(prev => prev.map(item =>
                item.id === idProducto
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
            setToastVisible(true);
        }

        const response = await ejecutarPeticion(`carrito/agregar-carrito/${idProducto}`, {
            method: "POST",
            body: JSON.stringify({ cantidad: 1 }),
        });

        if (response.exito) {
            if (!productoExistente) {
                // FIX 3: en lugar de llamar a cargarCarrito() (round-trip al servidor),
                // traemos solo el producto nuevo y lo agregamos al estado local.
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
                    setCartItems(prev => [...prev, {
                        id: idProducto,
                        nombre_producto: p.nombre_producto,
                        cantidad: 1,
                        precio: Number(p.precio),
                        capacidad: p.capacidad,
                        imagen,
                    }]);
                    setToastVisible(true);
                } else {
                    // Si por alguna razón falla la carga del producto,
                    // recurrimos al fetch completo como fallback
                    await cargarCarrito();
                }
            }
        } else {
            console.error("Error al agregar al carrito. Revirtiendo...");
            setCartItems(carritoOriginal);
        }

        setLoadingId(null);
    };

    // ─── 5. AUMENTAR CANTIDAD ────────────────────────────────────────────────
    const increaseQuantity = async (idProducto) => {
        setLoadingId(idProducto);
        const carritoOriginal = [...cartItems];

        // FIX 2: "cantidad" en lugar de "quantity"
        setCartItems(prev => prev.map(item =>
            item.id === idProducto
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
        ));

        const response = await ejecutarPeticion(`carrito/agregar-carrito/${idProducto}`, {
            method: "POST",
            body: JSON.stringify({ cantidad: 1 }),
        });

        if (!response.exito) {
            console.error("Falló al aumentar cantidad, revirtiendo...");
            setCartItems(carritoOriginal);
        }

        setLoadingId(null);
    };

    // ─── 6. DISMINUIR CANTIDAD ───────────────────────────────────────────────
    const decreaseQuantity = async (idProducto) => {
        setLoadingId(idProducto);
        const carritoOriginal = [...cartItems];

        // FIX 2: "cantidad" en lugar de "quantity"
        setCartItems(prev => prev.map(item => {
            if (item.id === idProducto) {
                return { ...item, cantidad: Math.max(1, item.cantidad - 1) };
            }
            return item;
        }));

        const response = await ejecutarPeticion(`carrito/eliminar-carrito/${idProducto}`, {
            method: "DELETE",
        });

        if (!response.exito) {
            setCartItems(carritoOriginal);
        }

        setLoadingId(null);
    };

    // ─── 7. ELIMINAR PRODUCTO ────────────────────────────────────────────────
    const removeFromCart = async (idProducto) => {
        setLoadingId(idProducto);
        const carritoOriginal = [...cartItems];

        setCartItems(prev => prev.filter(item => item.id !== idProducto));

        const response = await ejecutarPeticion(`carrito/eliminar-producto-completo/${idProducto}`, {
            method: "DELETE",
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