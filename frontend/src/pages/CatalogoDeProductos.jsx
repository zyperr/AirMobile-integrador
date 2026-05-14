
import CartaDeProductos from "../components/CartaDeProductos";
import Paginacion from "../components/Paginacion";

import "../style/catalogoDeProductos.css";
import { useEffect, useState } from "react";

import { CAPACIDADES_PERMITIDAS, categoriasValidas, CONDICIONES_PERMITIDAS } from "../../../backend/src/schemas/schemaProductos";
import FiltroRadioGroup from "../components/FiltroRadioGroup";
import MensajeSinResultados from "../components/MensajeSinResultado";



export default function CatalogoDeProductos() {
    const URL_API = "http://localhost:3000/api/productos/productos";
    const [producto, setProducto] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);

    const [dropdownAbierto, setDropdownAbierto] = useState(false);

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

    const [capacidadSeleccionada, setCapacidadSeleccionada] = useState('');

    const [condicionSeleccionada, setCondicionSeleccionada] = useState('');
    const [bateriaMinima, setBateriaMinima] = useState('');

    const [ordenarPor, setOrdenarPor] = useState('');


    // Estados para lo que el usuario está escribiendo en el momento
    const [inputPrecioMin, setInputPrecioMin] = useState('');
    const [inputPrecioMax, setInputPrecioMax] = useState('');

    // Estados oficiales que dispararán el useEffect (se actualizan al darle "Aplicar")
    const [precioMinimo, setPrecioMinimo] = useState('');
    const [precioMaximo, setPrecioMaximo] = useState('');

    // Función para alternar el estado
    const toggleDropdown = () => {
        setDropdownAbierto(!dropdownAbierto);
    };

    useEffect(() => {
        const fetchProducto = async () => {
            try {

                const url = new URL(URL_API);

                url.searchParams.set("page", paginaActual);

                if (categoriaSeleccionada) {
                    url.searchParams.set("categoria", categoriaSeleccionada);
                }
                if (capacidadSeleccionada) {
                    url.searchParams.set("capacidad", capacidadSeleccionada);
                }

                if (condicionSeleccionada) {
                    url.searchParams.set("condicion", condicionSeleccionada);
                }

                if (bateriaMinima) {
                    url.searchParams.set("bateriaMin", bateriaMinima);
                }

                if (precioMinimo) {
                    url.searchParams.set("precioMin", precioMinimo);
                }
                if (precioMaximo) {
                    url.searchParams.set("precioMax", precioMaximo);
                }
                if (ordenarPor) {
                    url.searchParams.set("orden", ordenarPor);
                }
                const respuesta = await fetch(url.toString());

                if (!respuesta.ok) {
                    throw new Error("Error en la petición al servidor");
                }
                const data = await respuesta.json();
                setProducto(data);
            } catch (error) {
                console.error("Error al cargar los productos:", error);
            }
        }

        // IMPORTANTE: Al poner 'pagina' aquí, cada vez que cambie el número, 
        // el useEffect se dispara solo y trae la nueva data.
        fetchProducto();
    }, [paginaActual, categoriaSeleccionada, capacidadSeleccionada, condicionSeleccionada, bateriaMinima, precioMinimo, precioMaximo, ordenarPor]);



    const cambiarPagina = (pagina) => {
        setPaginaActual(pagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const cambiarCategoria = (categoria) => {

        setCategoriaSeleccionada(`${categoria}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const cambiarCapacidad = (capacidad) => {
        setCapacidadSeleccionada(`${capacidad}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const cambiarCondicion = (condicion) => {
        setCondicionSeleccionada(`${condicion}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    const cambiarBateria = (bateria) => {
        setBateriaMinima(bateria);
    }

    const aplicarFiltroPrecio = () => {
        setPrecioMinimo(inputPrecioMin);
        setPrecioMaximo(inputPrecioMax);
        setPaginaActual(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cambiarOrden = (nuevoOrden) => {
        setOrdenarPor(nuevoOrden);
        setPaginaActual(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const limpiarTodosLosFiltros = () => {
        setCategoriaSeleccionada('');
        setCapacidadSeleccionada('');
        setCondicionSeleccionada('');
        setBateriaMinima('');
        setPrecioMinimo('');
        setPrecioMaximo('');
        setInputPrecioMax('');
        setInputPrecioMin('');
        setOrdenarPor('');
        setPaginaActual(1); // Importante: volver a la página 1 al limpiar filtros
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (
        <main className="container-fluid px-4 px-lg-5 py-5 custom-catalog-min-height">
            {/* Contenedor central con límite máximo de ancho */}
            <div className="row justify-content-center">
                <div className="col-12 d-flex flex-column flex-md-row gap-4" style={{ maxWidth: "1400px" }}>

                    {/* BARRA LATERAL (Filtros) */}
                    <aside className="sidebar-filters flex-shrink-0">
                        <h3 className="fs-5 fw-bold text-dark mb-4">Filtros</h3>

                        {/* Filtro: Modelo */}
                        <div className="dropdown mb-4 pb-3 border-bottom">
                            <h4 className="text-secondary text-uppercase mb-3" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
                                Categorías
                            </h4>

                            {/* Botón que despliega el menú */}
                            <button
                                // Agregamos condicionalmente la clase 'show' al botón (opcional, pero buena práctica)
                                className={`btn btn-primary dropdown-toggle w-100 text-start d-flex justify-content-between align-items-center ${dropdownAbierto ? 'show' : ''}`}
                                type="button"
                                onClick={toggleDropdown} // Usamos nuestro evento de React
                                aria-expanded={dropdownAbierto} // Actualizamos la accesibilidad
                                style={{ fontSize: "14px", borderColor: "#e5e5ea" }}
                            >
                                Seleccionar categorías
                            </button>

                            {/* Menú desplegable */}
                            <ul className={`dropdown-menu w-100 shadow-sm border-0 mt-2 p-3 ${dropdownAbierto ? 'show' : ''}`}>

                                {/* Opción extra para "Limpiar" el filtro */}
                                <li className="mb-3 border-bottom pb-2">
                                    <div className="form-check custom-dropdown-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="categoria-grupo"
                                            id="cat-todas"
                                            checked={categoriaSeleccionada === ""}
                                            onChange={() => {
                                                setCategoriaSeleccionada("");
                                                setDropdownAbierto(false);
                                            }
                                            } // Limpia el estado
                                        />
                                        <label className="form-check-label text-dark w-100" htmlFor="cat-todas" style={{ cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                                            Todas las categorías
                                        </label>
                                    </div>
                                </li>

                                {/* Mapeo de tus categorías */}
                                {categoriasValidas.map((categoria, index) => {
                                    return (
                                        <li key={index} className="mb-2">
                                            <div className="form-check custom-dropdown-check">
                                                <input
                                                    className="form-check-input custom-checkbox"
                                                    type="radio"
                                                    name="categoria-grupo"
                                                    id={`cat-${index}`}
                                                    checked={categoriaSeleccionada === categoria}
                                                    onChange={() => {
                                                        cambiarCategoria(categoria)
                                                        setDropdownAbierto(false);

                                                    }}
                                                />
                                                <label
                                                    className="form-check-label text-dark w-100 text-capitalize"
                                                    htmlFor={`cat-${index}`}
                                                    style={{ cursor: "pointer", fontSize: "14px" }}
                                                >
                                                    {categoria}
                                                </label>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>


                        {/* Filtro: Precio */}
                        <div className="mb-4 pb-3 border-bottom">
                            <h4 className="text-secondary text-uppercase mb-3" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
                                Precio
                            </h4>

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Mínimo"
                                    value={inputPrecioMin}
                                    onChange={(e) => setInputPrecioMin(e.target.value)}
                                    min="0"
                                />
                                <span className="text-secondary">-</span>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Máximo"
                                    value={inputPrecioMax}
                                    onChange={(e) => setInputPrecioMax(e.target.value)}
                                    min="0"
                                />
                            </div>

                            {/* Los botones aparecen solo si el usuario escribió algo en algún input */}
                            {(inputPrecioMin !== '' || inputPrecioMax !== '') && (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary btn-sm w-100 fw-bold"
                                        onClick={aplicarFiltroPrecio}
                                    >
                                        Aplicar
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={
                                            limpiarTodosLosFiltros
                                        }
                                        title="Limpiar precio"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Filtro: Condición */}
                        <FiltroRadioGroup
                            titulo="Condición"
                            nombreGrupo="condicion"
                            opciones={CONDICIONES_PERMITIDAS}
                            valorSeleccionado={condicionSeleccionada}
                            onChange={cambiarCondicion}
                            textoOpcionTodas="Todas las condiciones"
                        />

                        {/* Filtro: Capacidad */}
                        {/* Mantenemos la lógica de que no se muestre si eligen fundas/accesorios */}
                        {categoriaSeleccionada !== 'fundas' && categoriaSeleccionada !== 'accesorios' && categoriaSeleccionada !== 'cargadores' && categoriaSeleccionada !== 'protectores' && (
                            <FiltroRadioGroup
                                titulo="Capacidad"
                                nombreGrupo="capacidad"
                                opciones={CAPACIDADES_PERMITIDAS}
                                valorSeleccionado={capacidadSeleccionada}
                                onChange={cambiarCapacidad}
                                textoOpcionTodas="Todas las capacidades"
                            />
                        )}
                        {/* Filtro: Batería */}

                        {
                            categoriaSeleccionada !== 'fundas' && categoriaSeleccionada !== 'accesorios' && categoriaSeleccionada !== 'cargadores' && categoriaSeleccionada !== 'protectores' && (
                                <div className="mb-4 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h4 className="text-secondary text-uppercase m-0" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
                                            Salud de Batería
                                        </h4>
                                        {/* El Badge cambia visualmente si está activo o inactivo */}
                                        <span
                                            className="badge rounded-pill"
                                            style={{ backgroundColor: bateriaMinima ? "#0066cc" : "#6c757d" }}
                                        >
                                            {bateriaMinima ? `${bateriaMinima}% o más` : 'Inactivo'}
                                        </span>
                                    </div>

                                    {/* EL INPUT SLIDER */}
                                    <input
                                        type="range"
                                        className="form-range custom-range"
                                        min="70"
                                        max="100"
                                        step="10"
                                        id="filtroBateria"
                                        // TRUCO: Si el estado está vacío, el slider se queda visualmente en 70, pero sin afectar la URL
                                        value={bateriaMinima || "70"}
                                        onChange={(e) => {
                                            // Guardamos el valor directamente como texto
                                            cambiarBateria(e.target.value);
                                        }}
                                    />

                                    {/* Etiquetas visuales debajo del slider (volvemos al diseño original) */}
                                    <div className="d-flex justify-content-between text-secondary mt-1 px-1" style={{ fontSize: "11px", fontWeight: "500" }}>
                                        <span>70</span>
                                        <span>80</span>
                                        <span>90</span>
                                        <span>100</span>
                                    </div>

                                    {/* TRUCO UX: El botón solo aparece si el usuario movió el slider */}
                                    {bateriaMinima !== '' && (
                                        <button
                                            className="btn btn-outline-danger w-100 mt-3"
                                            onClick={() => cambiarBateria('')} // Limpiamos el estado
                                        >
                                            Apagar Filtro
                                        </button>
                                    )}
                                </div>
                            )
                        }


                    </aside>

                    {/* CONTENEDOR PRINCIPAL DEL CATÁLOGO */}

                    <section className="flex-grow-1 w-100 d-flex flex-column h-100">

                        {/* Cabecera */}
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-end mb-4 pb-2 border-bottom">

                            {/* Izquierda: Título y contador */}
                            <div>
                                <h2 className="fs-2 fw-bold text-dark m-0">Explorar Productos</h2>
                                <span className="text-secondary mt-2 d-block">
                                    Mostrando {producto?.paginacion?.totalResultados || 0} resultados
                                </span>
                            </div>

                            {/* Derecha: Selector de Ordenamiento */}
                            <div className="mt-3 mt-sm-0" style={{ minWidth: "220px" }}>
                                <label htmlFor="ordenarSelect" className="form-label text-secondary mb-1" style={{ fontSize: "13px" }}>
                                    Ordenar por:
                                </label>
                                <select
                                    id="ordenarSelect"
                                    className="form-select form-select-sm border-secondary shadow-sm cursor-pointer"
                                    value={ordenarPor}
                                    onChange={(e) => cambiarOrden(e.target.value)}
                                >
                                    <option value="">Más recientes (Por defecto)</option>
                                    <option value="asc">Más antiguos</option>

                                </select>
                            </div>

                        </div>




                        {/* Grilla de productos (Magia de Bootstrap) */}
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-4">
                            {

                                producto?.data?.length > 0 ? (
                                    producto?.data?.map((item) => (
                                        /* Cada CartaDeProductos va envuelta en una columna (col) */
                                        <div className="col" key={item.id}>
                                            <CartaDeProductos
                                                nombreDeProducto={item.nombre_producto}
                                                condicion={item.condicion}
                                                precio={item.precio}
                                                capacidad={item.capacidad}
                                                imagen_url={item.imagen_url}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <MensajeSinResultados onLimpiarFiltros={limpiarTodosLosFiltros}
                                        text="No pudimos encontrar productos que coincidan con los filtros seleccionados."
                                        text2={"Intenta elegir otra opción o limpiar la búsqueda."}

                                    />
                                )
                            }

                        </div>

                        <div className="">
                            {console.log(producto?.paginacion)}
                            <Paginacion
                                paginaActual={paginaActual}
                                tienePaginaAnterior={producto?.paginacion?.tienePaginaAnterior}
                                tienePaginaSiguiente={producto?.paginacion?.tienePaginaSiguiente}
                                cambiarPagina={cambiarPagina}
                            ></Paginacion>
                        </div>

                    </section>


                </div>

            </div>
        </main>
    );
};