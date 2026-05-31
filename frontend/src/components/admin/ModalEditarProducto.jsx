// ModalEditarProducto.jsx
import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";

const ModalEditarProducto = ({ isOpen, onClose, producto, onProductoActualizado }) => {

    const { token } = useAuth();
    const { ejecutarPeticion, isLoading } = useApi();
    const [error, setError] = useState(null);

    const estadoInicial = {
        nombre_producto: "",
        precio: "",
        stock: "",
        descripcion: "",
        categoria: "",
        condicion: "",
        bateria: "",
    };

    const [form, setForm] = useState(estadoInicial);

    // Cada vez que se abre el modal con un producto, precargamos los datos
    useEffect(() => {
        if (producto) {
            setForm({
                nombre_producto: producto.nombre_producto || "",
                precio:          producto.precio || "",
                stock:           producto.stock || "",
                descripcion:     producto.descripcion || "",
                categoria:       producto.categoria || "",
                condicion:       producto.condicion || "",
                bateria:         producto.bateria || "",
            });
            setError(null);
        }
    }, [producto]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Solo mandamos los campos que tienen valor
        const datosAActualizar = {};
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== null) {
                datosAActualizar[key] = value;
            }
        });

        const result = await ejecutarPeticion(`productos/actualizar-producto/${producto.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(datosAActualizar)
        });

        if (result.exito) {
            onProductoActualizado(producto.id, datosAActualizar);
            onClose();
        } else {
            setError(result.error || "No se pudo actualizar el producto.");
        }
    };

    const mostrarBateria = ["celulares", "tablets", "iphones", "smartphones", "ipad"].includes(form.categoria);

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">

                    {/* HEADER */}
                    <div className="modal-header">
                        <h5 className="modal-title">Editar Producto</h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>

                    {/* BODY */}
                    <div className="modal-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit} id="formEditarProducto">
                            <div className="row g-3">

                                {/* Nombre */}
                                <div className="col-md-8">
                                    <label className="form-label">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="nombre_producto"
                                        value={form.nombre_producto}
                                        onChange={handleChange}
                                        minLength="3"
                                        maxLength="50"
                                    />
                                </div>

                                {/* Precio */}
                                <div className="col-md-4">
                                    <label className="form-label">Precio ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-control"
                                        name="precio"
                                        value={form.precio}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Stock */}
                                <div className="col-md-4">
                                    <label className="form-label">Stock</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Categoría */}
                                <div className="col-md-4">
                                    <label className="form-label">Categoría</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="categoria"
                                        value={form.categoria}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Condición */}
                                <div className="col-md-4">
                                    <label className="form-label">Condición</label>
                                    <select
                                        className="form-select"
                                        name="condicion"
                                        value={form.condicion}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione condición</option>
                                        <option value="NUEVO">Nuevo</option>
                                        <option value="USADO">Usado</option>
                                        <option value="REACONDICIONADO">Reacondicionado</option>
                                    </select>
                                </div>

                                {/* Batería — solo para celulares/tablets */}
                                {mostrarBateria && (
                                    <div className="col-md-6">
                                        <label className="form-label">Salud de Batería (%)</label>
                                        <input
                                            type="number"
                                            min="70"
                                            max="100"
                                            className="form-control"
                                            name="bateria"
                                            value={form.bateria}
                                            onChange={handleChange}
                                            placeholder="Ej: 85"
                                        />
                                    </div>
                                )}

                                {/* Descripción */}
                                <div className="col-12">
                                    <label className="form-label">Descripción</label>
                                    <textarea
                                        className="form-control"
                                        name="descripcion"
                                        value={form.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        maxLength="500"
                                    />
                                </div>

                            </div>
                        </form>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="formEditarProducto"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalEditarProducto;