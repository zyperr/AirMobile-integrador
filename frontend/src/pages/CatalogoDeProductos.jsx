
import CartaDeProductos from "../components/CartaDeProductos";
import Paginacion from "../components/Paginacion";

import "../style/catalogoDeProductos.css";
import { useEffect, useState } from "react";



export default function CatalogoDeProductos() {
    const URL_API = "http://localhost:3000/api/productos/productos";
    const [producto, setProducto] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                const respuesta = await fetch(`${URL_API}?page=${paginaActual}`);
                const data = await respuesta.json();
                setProducto(data);
            } catch (error) {
                console.error("Error al cargar los productos:", error);
            }
        }

        // IMPORTANTE: Al poner 'pagina' aquí, cada vez que cambie el número, 
        // el useEffect se dispara solo y trae la nueva data.
        fetchProducto();
    }, [paginaActual]);



    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }



    return (
        <main className="container-fluid px-4 px-lg-5 py-5 custom-catalog-min-height">
            {/* Contenedor central con límite máximo de ancho */}
            <div className="row justify-content-center">
                <div className="col-12 d-flex flex-column flex-md-row gap-4" style={{ maxWidth: "1400px" }}>

                    {/* BARRA LATERAL (Filtros) */}
                    <aside className="sidebar-filters flex-shrink-0">
                        <h3 className="fs-5 fw-bold text-dark mb-4">Filtros</h3>

                        {/* Filtro: Modelo */}
                        <div className="mb-4 pb-3 border-bottom">
                            <h4 className="text-secondary text-uppercase mb-3" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>Modelo</h4>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="mod1" />
                                <label className="form-check-label text-dark" htmlFor="mod1">iPhone 15 Pro</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="mod2" />
                                <label className="form-check-label text-dark" htmlFor="mod2">iPhone 15</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="mod3" />
                                <label className="form-check-label text-dark" htmlFor="mod3">iPhone 14 Pro</label>
                            </div>
                        </div>

                        {/* Filtro: Condición */}
                        <div className="mb-4 pb-3 border-bottom">
                            <h4 className="text-secondary text-uppercase mb-3" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>Condición</h4>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="cond1" />
                                <label className="form-check-label text-dark" htmlFor="cond1">Mint</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="cond2" />
                                <label className="form-check-label text-dark" htmlFor="cond2">Excelente</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="cond3" />
                                <label className="form-check-label text-dark" htmlFor="cond3">Bueno</label>
                            </div>
                        </div>

                        {/* Filtro: Capacidad */}
                        <div className="mb-4 pb-3 border-bottom">
                            <h4 className="text-secondary text-uppercase mb-3" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>Capacidad</h4>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="cap1" />
                                <label className="form-check-label text-dark" htmlFor="cap1">128GB</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="cap2" />
                                <label className="form-check-label text-dark" htmlFor="cap2">256GB</label>
                            </div>
                            <div className="form-check mb-2">
                                <input className="form-check-input custom-checkbox" type="checkbox" id="cap3" />
                                <label className="form-check-label text-dark" htmlFor="cap3">512GB</label>
                            </div>
                        </div>
                    </aside>

                    {/* CONTENEDOR PRINCIPAL DEL CATÁLOGO */}
                    <section className="flex-grow-1 w-100">

                        {/* Cabecera */}
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end mb-4 pb-2">
                            <h2 className="fs-2 fw-bold text-dark m-0">Explorar Productos</h2>
                            <span className="text-secondary mt-2 mt-sm-0">
                                Mostrando {producto?.paginacion?.totalResultados || 0} resultados
                            </span>
                        </div>

                        {/* Grilla de productos (Magia de Bootstrap) */}
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                            {producto?.data?.map((item) => (
                                /* Cada CartaDeProductos va envuelta en una columna (col) */
                                <div className="col" key={item.id}>
                                    <CartaDeProductos
                                        nombreDeProducto={item.nombre_producto}
                                        condicion={item.condicion}
                                        precio={item.precio}
                                        capacidad={item.capacidad}
                                    />
                                </div>
                            ))}
                        </div>


                        <div className="">
                            {console.log(producto?.paginacion)}


                            <Paginacion
                                paginaActual={paginaActual}
                                tienePaginaAnterior={producto?.paginacion.tienePaginaAnterior}
                                tienePaginaSiguiente={producto?.paginacion.tienePaginaSiguiente}
                                cambiarPagina={cambiarPagina}
                            ></Paginacion>
                        </div>

                    </section>


                </div>

            </div>
        </main>
    );
};