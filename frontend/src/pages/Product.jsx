import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import "../style/home.css";
import "../style/detalleProducto.css";
import { React } from "react";
import { ImageGallery } from "../components/ImageGallery";
import { LoadingCard } from "../components/LoadingCard";
import { ErrorCard } from "../components/ErrorCard";
import { Condition } from "../components/Condition";
import { CapacitySelector } from "../components/CapacitySelector";
import { categoriasValidasParaCapacidad } from "../../../backend/src/schemas/schemaProductos.js"
import { BtnAccion } from "../components/BtnAccion.jsx";
import { DescripcionProducto } from "../components/DescripcionProducto.jsx";
import { ProductosRelacionados } from "../components/ProductosRelacionados.jsx";


export default function Product() {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const { id } = useParams();
  const [products, setProducts] = useState([])
  const [added, setAdded] = useState(false);
  const [capacidad, setCapacidad] = useState(null);


  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const { ejecutarPeticion, isLoading, error } = useApi();

  const endpoint = "productos/";

  useEffect(() => {
    const buscarProducto = async () => {
      const resultado = await ejecutarPeticion(endpoint.concat(id), {
        method: "GET",
      })
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
  console.log(products.data)
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

          <div className="d-flex align-items-baseline gap-2 mb-4">
            <span className="fw-bold text-primary" style={{ fontSize: "1.8rem" }}>
              ${products.data?.precio.toFixed(2)}
            </span>
          </div>

          <div className="mb-4">
            <label className="text-muted fw-medium mb-2 d-block" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Condición</label>
            <Condition condicion={products.data?.condicion} />
          </div>

          <div className="mb-4">
            {categoriasValidasParaCapacidad.includes(products?.data?.categoria) && (
              <>
                <label className="text-muted fw-medium mb-2 d-block" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>Capacidad</label>
                <CapacitySelector
                  capacidadesBackend={products.data.capacidad}
                  precioBase={products.data.precio}
                />
              </>
            )}
          </div>

          {/* Botón de añadir al carrito */}
          <div className="mt-auto">
            <BtnAccion
              activo={added}
              onClick={handleAdd}
              disabled={isLoading}
            />
          </div>

        </div>

        {/* FILA INFERIOR: Descripción */}
        <div className="col-9 mt-2">
          <DescripcionProducto descripcion={products.data?.descripcion} />
        </div>
        <ProductosRelacionados
          categoria={products.data?.categoria}
          idActual={products.data?.id}
        />
      </div>
    </section>
  );
}