import { useState } from "react";
import { useApi } from "../../hooks/useApi"; // Asegurate de que la ruta sea correcta
import { 
    categoriasValidas, 
    CONDICIONES_PERMITIDAS, 
    CAPACIDADES_PERMITIDAS 
} from "../../utils/schemaProductos"; 

const ModalNuevoProducto = ({ isOpen, onClose }) => {
    const estadoInicial = {
        nombre_producto: "",
        precio: "",
        descripcion: "",
        categoria: "",
        condicion: "",
        capacidad: "",
        bateria: ""
    };

    const [form, setForm] = useState(estadoInicial);
    const [imagenes, setImagenes] = useState([]);
    
    // Importamos todo desde tu hook
    const { ejecutarPeticion, isLoading, error, setError } = useApi();

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            setError("Solo podés subir un máximo de 3 imágenes.");
            e.target.value = null; 
            return;
        }
        setError(null);
        setImagenes(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Limpiamos errores previos usando la función del hook

        // 1. Armamos el FormData
        const formData = new FormData();
        
        formData.append("nombre_producto", form.nombre_producto);
        formData.append("precio", form.precio);
        formData.append("categoria", form.categoria);
        formData.append("condicion", form.condicion);
        
        if (form.descripcion) formData.append("descripcion", form.descripcion);
        if (form.capacidad) formData.append("capacidad[]", form.capacidad); 

        const requiereBateria = ["celulares", "tablets"].includes(form.categoria);
        if (requiereBateria && form.bateria) {
            formData.append("bateria", form.bateria);
        }

        imagenes.forEach((imagen) => {
            formData.append("imagenes", imagen);
        });

        // 2. Ejecutamos la petición con tu hook
        // Nota: Le pasamos un header especial para anular el application/json temporalmente
        const respuesta = await ejecutarPeticion("productos/agregar-productos", {
            method: "POST",
            body: formData,
            headers: {
                // Al enviar FormData, no debemos usar application/json
                "Content-Type": undefined 
            }
        });

        // 3. Evaluamos la respuesta estructurada de tu hook
        if (respuesta.exito) {
            setForm(estadoInicial);
            setImagenes([]);
            onClose();
        }
        // No hace falta un bloque "catch" o manejar el error acá, 
        // porque tu hook useApi ya se encarga de atraparlo y setear la variable 'error'.
    };

    const mostrarCamposTech = ["celulares", "tablets"].includes(form.categoria);

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Crear Nuevo Producto</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {/* El error ahora viene directamente del hook */}
                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleSubmit} id="formNuevoProducto">
                            <div className="row g-3">
                                {/* Nombre */}
                                <div className="col-md-8">
                                    <label className="form-label">Nombre del Producto *</label>
                                    <input type="text" className="form-control" name="nombre_producto" value={form.nombre_producto} onChange={handleChange} required minLength="3" maxLength="50" />
                                </div>

                                {/* Precio */}
                                <div className="col-md-4">
                                    <label className="form-label">Precio ($) *</label>
                                    <input type="number" step="0.01" min="0" className="form-control" name="precio" value={form.precio} onChange={handleChange} required />
                                </div>

                                {/* Categoría */}
                                <div className="col-md-6">
                                    <label className="form-label">Categoría *</label>
                                    <select className="form-select" name="categoria" value={form.categoria} onChange={handleChange} required>
                                        <option value="">Seleccione una categoría</option>
                                        {categoriasValidas.map(cat => (
                                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Condición */}
                                <div className="col-md-6">
                                    <label className="form-label">Condición *</label>
                                    <select className="form-select" name="condicion" value={form.condicion} onChange={handleChange} required>
                                        <option value="">Seleccione condición</option>
                                        {CONDICIONES_PERMITIDAS.map(cond => (
                                            <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Campos Condicionales */}
                                {mostrarCamposTech && (
                                    <>
                                        <div className="col-md-6">
                                            <label className="form-label">Salud de Batería (%)</label>
                                            <input type="number" min="70" max="100" className="form-control" name="bateria" value={form.bateria} onChange={handleChange} placeholder="Ej: 85" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Capacidad</label>
                                            <select className="form-select" name="capacidad" value={form.capacidad} onChange={handleChange}>
                                                <option value="">Opcional</option>
                                                {CAPACIDADES_PERMITIDAS.map(cap => (
                                                    <option key={cap} value={cap}>{cap}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Imágenes */}
                                <div className="col-12">
                                    <label className="form-label">Imágenes (Máx 3) *</label>
                                    <input type="file" className="form-control" accept="image/*" multiple onChange={handleFileChange} required />
                                </div>

                                {/* Descripción */}
                                <div className="col-12">
                                    <label className="form-label">Descripción</label>
                                    <textarea className="form-control" name="descripcion" value={form.descripcion} onChange={handleChange} rows="3" maxLength="500"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" form="formNuevoProducto" className="btn btn-primary" disabled={isLoading}>
                            {/* El isLoading ahora viene directamente del hook */}
                            {isLoading ? "Guardando..." : "Guardar Producto"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalNuevoProducto;