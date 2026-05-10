import Navbar from "../components/Navbar";
import CartaDeProductos from "../components/CartaDeProductos";
import "../style/catalogoDeProductos.css";
import { use, useEffect, useState } from "react";









export default function CatalogoDeProductos() {
 const mockProducts = [1, 2, 3, 4, 5, 6]; 
 
 
const URL_API = "http://localhost:3000/api/productos/productos";
const [producto, setProducto] = useState(null);


    useEffect(() => {
        const fetchProducto = async()=>{
            const respuesta = await fetch(URL_API);
            const data = await respuesta.json();
            setProducto(data);
        }
        fetchProducto();
        },[]);


console.log(producto);

 
 
 return (
        <>
            <main className="product-list-container">

                {/* Barra lateral para filtros */}
                <aside className="sidebar-filters">
                    <h3 className="filters-title">Filtros</h3>

                    <div className="filter-section">
                        <h4>Modelo</h4>
                        <label><input type="checkbox" /> iPhone 15 Pro</label>
                        <label><input type="checkbox" /> iPhone 15</label>
                        <label><input type="checkbox" /> iPhone 14 Pro</label>
                    </div>

                    <div className="filter-section">
                        <h4>Condición</h4>
                        <label><input type="checkbox" /> Mint</label>
                        <label><input type="checkbox" /> Excelente</label>
                        <label><input type="checkbox" /> Bueno</label>
                    </div>

                    <div className="filter-section">
                        <h4>Capacidad</h4>
                        <label><input type="checkbox" /> 128GB</label>
                        <label><input type="checkbox" /> 256GB</label>
                        <label><input type="checkbox" /> 512GB</label>
                    </div>
                </aside>

                {/* Contenedor principal del catálogo */}
                <section className="catalog-section">

                    {/* Cabecera del listado */}
                    <div className="catalog-header">
                        <h2>Explorar Productos</h2>
                        <span className="results-count">Mostrando {producto?.paginacion?.totalResultados} resultados</span>
                    </div>

                    {/* Grilla de productos */}
                    <div className="products-grid">
                        {producto?.data?.map((item, index) => (
                            // Renderizamos el componente ProductCard varias veces para armar la grilla
                            <CartaDeProductos key={item.id} nombreDeProducto={item.nombre_producto} condicion={item.condicion} precio={item.precio} capacidad={item.capacidad} />
                        ))}
                    </div>

                </section>
            </main></>
  );
};
