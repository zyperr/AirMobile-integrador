import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import ProductCard from './CartaDeProductos';

export const ProductosRelacionados = ({ categoria, idActual }) => {
    const [relacionados, setRelacionados] = useState([]);
    const { ejecutarPeticion, isLoading } = useApi();

    useEffect(() => {
        const buscarRelacionados = async () => {
            const endpoint = "productos/productos";
            const query = `?categoria=${categoria}`

            const resultado = await ejecutarPeticion(endpoint.concat(query), {
                method: "GET",
            })

            if (resultado.exito) {
                // Filtramos por la misma categoría, excluímos el producto actual, y nos quedamos solo con 4
                const { data } = resultado.data
                const filtrados = data
                    ?.filter(prod => prod.categoria === categoria && prod.id !== idActual)
                    ?.slice(0, 4);

                console.log(filtrados)
                setRelacionados(filtrados);
            }
        };

        if (categoria) {
            buscarRelacionados();
        }
    }, [categoria, idActual]); // Se vuelve a ejecutar si el usuario hace clic en un producto relacionado

    // Si está cargando o no hay productos relacionados, no mostramos nada 
    if (isLoading || relacionados?.length === 0) return null;


    return (
        <div className="mt-5 pt-5 border-top">
            <h3 className="fw-bold mb-4">También te podría interesar</h3>
            <div className="row g-4">
                {relacionados?.map((prod) => (
                    <div key={prod.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <ProductCard condicion={prod.condicion} id={prod.id} imagen_url={prod.imagen_url} nombreDeProducto={prod.nombre_producto} precio={prod.precio} capacidad={prod.capacidad} />
                    </div>
                ))}
            </div>
        </div>
    );
};