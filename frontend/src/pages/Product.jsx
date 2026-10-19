import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import "../style/home.css";
import "../style/detalleProducto.css";
import { React } from "react";
import { ImageGallery } from "../components/productos/ImageGallery.jsx";
import { LoadingCard } from "../components/common/LoadingCard";
import { ErrorCard } from "../components/common/ErrorCard";
import { Condition } from "../components/productos/Condition.jsx";
import { CapacitySelector } from "../components/productos/CapacitySelector.jsx";
import { categoriasValidasParaCapacidad } from "../../../backend/src/schemas/schemaProductos.js"
import { BtnAccion } from "../components/common/BtnAccion.jsx";
import { DescripcionProducto } from "../components/productos/DescripcionProducto.jsx";
import { ProductosRelacionados } from "../components/productos/ProductosRelacionados.jsx";
import { SkeletonLoader } from "../components/common/SkeletonLoader.jsx";
import MensajeSinResultados from "../components/common/MensajeSinResultado.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCarrito } from "../context/CarritoContext.jsx";

export default function Product() {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const { id } = useParams();
  const [products, setProducts] = useState([])
  const [added, setAdded] = useState(false);
  const [capacidad, setCapacidad] = useState(null);

  const { agregarProducto } = useCarrito();
  const { estaAutenticado } = useAuth();
  const { ejecutarPeticion, isLoading, error } = useApi();
  const endpoint = "productos/";

  const handleAdd = async () => {
        // 1. Verificamos si este producto necesita capacidad
        const requiereCapacidad = categoriasValidasParaCapacidad.includes(products?.data?.categoria);

        // 2. Validación de UX
        if (requiereCapacidad && !capacidad) {
            alert("Por favor, selecciona una capacidad antes de añadir al carrito.");
            return;
        }

        // 3. ¡Usamos el Context! Él se encargará de hacer el Fetch, actualizar el backend, 
        // mostrar el Toast y subir el contador en el Navbar.
        await agregarProducto(
            products.data.id, 
            requiereCapacidad ? capacidad : null
        );

        setAdded(true);
        setTimeout(() => setAdded(false), 1500); // Reseteamos el estado después de 1.5 segundos
    };

  useEffect(() => {
    const buscarProducto = async () => {
      const resultado = await ejecutarPeticion(endpoint.concat(id), {
        method: "GET",
      })

      setProducts(null);
      if (resultado.exito) {
        setProducts(resultado.data)
      }
    }

    buscarProducto()
  }, [id]);

  if (isLoading || !products) {
    return (
      <LoadingCard text={"Cargando detalles del producto..."} err={error} title={"Cargando"} />
    );
  }

  if (error) {
    return (
      <ErrorCard errorServidor={`Ops hubo un problema ${error}`} />
    );
  }

  return (
    <section className="container  py-5 min-vh-100" >

      {/* 2. Le damos un gap más grande en pantallas grandes (g-lg-5) para que respire */}
      <div className="row d-flex justify-content-center align-content-center g-4 g-lg-5 mb-5">

        {/* COLUMNA IZQUIERDA: Galería de imágenes */}
        <div className="col-lg-6">
          <ImageGallery images={products.data?.imagen_url} />
        </div>

        {/* COLUMNA DERECHA: Info del producto */}
        <div className="col-lg-6 text-start d-flex flex-column justify-content-center">

          <h3 className="fw-bold mb-3">{products.data?.nombre_producto}</h3>

          {/* --- AQUÍ REEMPLAZAMOS EL PRECIO ESTÁTICO POR EL CÁLCULO DINÁMICO --- */}
          {(() => {
            const precioBase = products.data?.precio || 0;
            const listaCapacidades = products.data?.capacidad || [];
            // Tu estado se llama "capacidad" en este archivo, así que usamos ese
            const index = listaCapacidades.indexOf(capacidad);
            
            let extra = 0;
            if (index === 1) extra = 100;
            if (index === 2) extra = 250;
            if (index === 3) extra = 400;

            const precioFinal = precioBase + extra;

            return (
              <div className="d-flex align-items-baseline gap-2 mb-4">
                <span className="fw-bold text-primary" style={{ fontSize: "1.8rem" }}>
                  ${precioFinal.toFixed(2)}
                </span>
              </div>
            );
          })()}

          <div className="mb-4">
            <label className="text-muted fw-medium mb-2 d-block" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Condición</label>
            <Condition condicion={products.data?.condicion} />
          </div>

          <div className="mb-4">
            {categoriasValidasParaCapacidad.includes(products?.data?.categoria) && (
              <>
                <label className="text-muted fw-medium mb-2 d-block" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Capacidad</label>
                {/* CONECTAMOS EL SELECTOR CON EL ESTADO DEL PADRE */}
                <CapacitySelector
                  capacidadesBackend={products.data.capacidad}
                  precioBase={products.data.precio}
                  capacidadSeleccionada={capacidad} // <-- Le pasamos el estado actual
                  onSeleccionarCapacidad={setCapacidad} // <-- Le pasamos el modificador
                />
              </>
            )}
          </div>

          <div className="mt-auto">
            {estaAutenticado ? (
              <BtnAccion
                activo={added}
                onClick={handleAdd} // <-- Llama a nuestra función con validación
                disabled={isLoading}
              />
            ) : (
              <ErrorCard errorServidor={"Necesita tener una cuenta para añadir al carrito"} />
            )}
          </div>
        </div>

        {/* FILA INFERIOR: Descripción */}
        <div className="col-9 mt-2">
          <DescripcionProducto descripcion={products.data?.descripcion} />
        </div>

        {
          (isLoading || products === null) ? (
            <SkeletonLoader cantidad={4} />)
            : (
              <ProductosRelacionados
                categoria={products.data?.categoria}
                idActual={products.data?.id}
              />
            )
        }

      </div>
    </section>
  );
}