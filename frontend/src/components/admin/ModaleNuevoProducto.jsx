import { useState } from "react";
// Importá tus constantes desde tu archivo de esquemas o utils
import { 
    categoriasValidas, 
    CONDICIONES_PERMITIDAS, 
    CAPACIDADES_PERMITIDAS, 
    categoriasValidasParaCapacidad 
} from "../../../../backend/src/schemas/schemaProductos.js"; 

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
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Si el modal está cerrado, no renderizamos nada
    if (!isOpen) return null;

    // Manejador genérico para los inputs de texto/números
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Manejador específico para los archivos (máximo 3)
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            setError("Solo podés subir un máximo de 3 imágenes.");
            // Limpiamos el input para que vuelva a intentar
            e.target.value = null; 
            return;
        }
        setError(null);
        setImagenes(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // 1. Armamos el FormData (esencial para enviar archivos)
            const formData = new FormData();
            
            // Agregamos los campos obligatorios
            formData.append("nombre_producto", form.nombre_producto);
            formData.append("precio", form.precio);
            formData.append("categoria", form.categoria);
            formData.append("condicion", form.condicion);
            
            // Agregamos los opcionales solo si tienen un valor
            if (form.descripcion) formData.append("descripcion", form.descripcion);
            
            // La capacidad en tu Joi es un array, así que lo enviamos como tal
            if (form.capacidad) formData.append("capacidad[]", form.capacidad); 

            // La batería solo se envía si es celular o tablet
            const requiereBateria = ["celulares", "tablets"].includes(form.categoria);
            if (requiereBateria && form.bateria) {
                formData.append("bateria", form.bateria);
            }

            // 2. Agregamos las imágenes al FormData
            // NOTA: Asegurate de que tu backend (Multer) esté esperando el campo "imagenes"
            imagenes.forEach((imagen) => {
                formData.append("imagenes", imagen);
            });

            // 3. Enviamos la petición al backend (Reemplazá con tu hook/función de API)
            const response = await fetch("http://localhost:3000/api/productos/crear", {
                method: "POST",
                // ¡CUIDADO! Cuando usas FormData, NO tenés que setear el header 'Content-Type' a 'application/json'
                // El navegador le pone automáticamente 'multipart/form-data' con un Boundary.
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al crear el producto");
            }

            // Éxito: Limpiamos formulario, cerramos modal y recargamos la tabla
            setForm(estadoInicial);
            setImagenes([]);
            onClose();
            

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Lógica para mostrar/ocultar campos dinámicos
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

                                {/* Campos Condicionales (Batería y Capacidad) */}
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
                            {isLoading ? "Guardando..." : "Guardar Producto"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalNuevoProducto;