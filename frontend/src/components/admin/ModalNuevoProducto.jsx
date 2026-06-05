import { useApi } from "../../hooks/useApi";
import { useForm } from "react-hook-form"; // Importamos React Hook Form
import {
    categoriasValidas,
    CONDICIONES_PERMITIDAS,
    CAPACIDADES_PERMITIDAS
} from "../../../../backend/src/schemas/schemaProductos.js";
import { InputGenerico } from "../common/InputGenerico.jsx";
import { BtnAccion } from "../common/BtnAccion.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ModalNuevoProducto = ({ isOpen, onClose }) => {
    const { ejecutarPeticion, isLoading, error: apiError, setError: setApiError } = useApi();
    const { token } = useAuth();

    // 1. Inicializamos React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset,
        formState: { errors }
    } = useForm({
        mode: "onChange",
        defaultValues: {
            nombre_producto: "",
            precio: "",
            descripcion: "",
            categoria: "",
            condicion: "",
            capacidad: [], // Arreglo para la botonera múltiple
            bateria: "",
            imagenes: null // Manejo de archivos
        }
    });

    if (!isOpen) return null;

    // 2. Usamos "watch" para observar en tiempo real la categoría y actualizar la UI
    const categoriaActual = watch("categoria");
    const capacidadesSeleccionadas = watch("capacidad");
    const mostrarCamposTech = ["celulares", "tablets"].includes(categoriaActual);

    // 3. Adaptamos la botonera usando getValues y setValue de RHF
    const handleCapacidadToggle = (cap) => {
        const current = getValues("capacidad") || [];
        const yaSeleccionada = current.includes(cap);

        const nuevasCapacidades = yaSeleccionada
            ? current.filter(c => c !== cap)
            : [...current, cap];

        // Actualizamos el estado interno de RHF
        setValue("capacidad", nuevasCapacidades, { shouldValidate: true });
    };

    // 4. La función de envío (RHF ya nos entrega la "data" procesada y validada)
    const onSubmit = async (data) => {
        setApiError(null);

        const formData = new FormData();

        formData.append("nombre_producto", data.nombre_producto);
        formData.append("precio", data.precio);
        formData.append("categoria", data.categoria);
        formData.append("condicion", data.condicion);

        if (data.descripcion) formData.append("descripcion", data.descripcion);

        if (data.capacidad && data.capacidad.length > 0) {
            data.capacidad.forEach(cap => {
                formData.append("capacidad[]", cap);
            });
        }

        if (mostrarCamposTech && data.bateria) {
            formData.append("bateria", data.bateria);
        }

        // RHF guarda los archivos en un FileList dentro de data.imagenes
        if (data.imagenes) {
            Array.from(data.imagenes).forEach((imagen) => {
                formData.append("imagenes", imagen);
            });
        }

        const respuesta = await ejecutarPeticion("productos/agregar-productos", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        if (respuesta.exito) {
            reset(); // RHF limpia todo el formulario automáticamente
            onClose();
        }
    };

    const labelStyle = "form-label text-muted small fw-bold text-uppercase mb-1";

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "12px" }}>

                    <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                        <h5 className="modal-title fw-bold fs-4">Crear Nuevo Producto</h5>
                        <button type="button" className="btn-close shadow-none" onClick={() => { reset(); onClose(); }}></button>
                    </div>

                    <div className="modal-body px-4 py-3">
                        {apiError && <div className="alert alert-danger rounded-3 shadow-sm">{apiError}</div>}

                        {/* RHF envuelve nuestra función en su propio handleSubmit para validar antes */}
                        <form onSubmit={handleSubmit(onSubmit)} id="formNuevoProducto">

                            {/* --- SECCIÓN 1: INFO BÁSICA --- */}
                            <div className="mb-4">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                                    <i className="bi bi-box-seam me-2"></i>Información General
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <InputGenerico
                                            label="Nombre del Producto *"
                                            name="nombre_producto"
                                            register={register}
                                            errors={errors.nombre_producto}
                                            reglas={{
                                                required: "El nombre es obligatorio",
                                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                                maxLength: { value: 50, message: "Máximo 50 caracteres" }
                                            }}
                                            placeholder="Ej: iPhone 13 Pro Max"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <div className="input-group">
                                            <InputGenerico
                                                label="Precio ($) *"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                name="precio"
                                                register={register}
                                                errors={errors.precio}
                                                reglas={{ required: "El precio es obligatorio" }}
                                                placeholder="0.00"
                                                isPrice={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className={labelStyle}>Categoría *</label>
                                        <select
                                            className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                                            {...register("categoria", { required: "Selecciona una categoría" })}
                                        >
                                            <option value="">Seleccione una categoría</option>
                                            {categoriasValidas.map(cat => (
                                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                            ))}
                                        </select>
                                        {errors.categoria && <span className="invalid-feedback">{errors.categoria.message}</span>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className={labelStyle}>Condición *</label>
                                        <select
                                            className={`form-select ${errors.condicion ? 'is-invalid' : ''}`}
                                            {...register("condicion", { required: "Selecciona una condición" })}
                                        >
                                            <option value="">Seleccione condición</option>
                                            {CONDICIONES_PERMITIDAS.map(cond => (
                                                <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
                                            ))}
                                        </select>
                                        {errors.condicion && <span className="invalid-feedback">{errors.condicion.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* --- SECCIÓN 2: ESPECIFICACIONES --- */}
                            {mostrarCamposTech && (
                                <div className="bg-light p-3 rounded-3 border mb-4">
                                    <h6 className="text-dark fw-bold mb-3">
                                        <i className="bi bi-cpu me-2"></i>Especificaciones Técnicas
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-5">
                                            <InputGenerico
                                                type="number"
                                                label="Salud de Batería (%)"
                                                name="bateria"
                                                register={register}
                                                errors={errors.bateria}
                                                reglas={{
                                                    min: { value: 70, message: "Mínimo 70%" },
                                                    max: { value: 100, message: "Máximo 100%" }
                                                }}
                                                placeholder="Ej: 85"
                                            />
                                        </div>

                                        <div className="col-md-7">
                                            <label className={labelStyle}>Capacidades Disponibles</label>
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                {CAPACIDADES_PERMITIDAS.map(cap => {
                                                    const isSelected = capacidadesSeleccionadas.includes(cap);
                                                    return (
                                                        <button
                                                            key={cap}
                                                            type="button"
                                                            className={`btn btn-sm ${isSelected ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                                                            onClick={() => handleCapacidadToggle(cap)}
                                                            style={{ borderRadius: '20px', fontWeight: '500' }}
                                                        >
                                                            {cap}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <small className="text-muted d-block mt-2" style={{ fontSize: '0.75rem' }}>
                                                Puedes seleccionar una o múltiples opciones.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- SECCIÓN 3: MULTIMEDIA --- */}
                            <div className="mb-2">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                                    <i className="bi bi-images me-2"></i>Multimedia y Detalles
                                </h6>
                                <div className="row g-3">
                                    <div className="col-12">
                                        {/* Cuidado: Asegurate de que InputGenerico devuelva un textarea si le pasas "as='textarea'" u omitilo y usá etiqueta nativa */}
                                        <label className={labelStyle}>Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Escribe los detalles y características del producto..."
                                            {...register("descripcion", { maxLength: 500 })}
                                        ></textarea>
                                    </div>
                                    <div className="col-12">
                                        <InputGenerico
                                            label="Imágenes (Máx 3) *"
                                            type="file"
                                            name="imagenes"
                                            accept="image/jpeg, image/png, image/webp"
                                            multiple // Agregamos multiple para permitir varias
                                            register={register}
                                            errors={errors.imagenes}
                                            reglas={{
                                                required: "Las imágenes son obligatorias",
                                                validate: {
                                                    // BARRERA 2: Reglas de validación precisas
                                                    limiteArchivos: (files) =>
                                                        files.length <= 3 || "Solo podés subir un máximo de 3 imágenes.",

                                                    tipoArchivo: (files) => {
                                                        // Revisamos uno por uno que sean imágenes válidas
                                                        const permitidos = ["image/jpeg", "image/png", "image/webp"];
                                                        for (let i = 0; i < files.length; i++) {
                                                            if (!permitidos.includes(files[i].type)) {
                                                                return "Solo se permiten formatos JPG, PNG o WEBP.";
                                                            }
                                                        }
                                                        return true;
                                                    },

                                                    pesoMaximo: (files) => {
                                                        // Extra: Evitar que suban imágenes de 50MB que te tiren el servidor
                                                        for (let i = 0; i < files.length; i++) {
                                                            if (files[i].size > 5 * 1024 * 1024) { // 5 Megabytes
                                                                return "Cada imagen debe pesar menos de 5MB.";
                                                            }
                                                        }
                                                        return true;
                                                    }
                                                }
                                            }}
                                        />
                                        <small className="text-muted mt-1 d-block">Formatos soportados: JPG, PNG, WEBP.</small>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* PIE DEL MODAL */}
                    <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                        <BtnAccion
                            type="button"
                            onClick={() => { reset(); onClose(); }}
                            textoDefault="Cancelar"
                            iconoDefault="" // Lo dejamos vacío para que no dibuje el carrito
                            colorDefault="btn-light border"
                            isFullWidth={false} // Evita que ocupe todo el ancho
                            className="px-4"
                        />

                        {/* Botón Guardar */}
                        <BtnAccion
                            type="submit"
                            form="formNuevoProducto"
                            isLoading={isLoading}
                            textoDefault="Guardar Producto"
                            textoCargando="Guardando..."
                            iconoDefault=""
                            colorDefault="btn-primary"
                            isFullWidth={false}
                            className="px-4 shadow-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalNuevoProducto;