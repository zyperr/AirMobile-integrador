import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import {
    categoriasValidas,
    CONDICIONES_PERMITIDAS,
    CAPACIDADES_PERMITIDAS
} from "../../../../backend/src/schemas/schemaProductos.js";
import { InputGenerico } from "../common/InputGenerico.jsx";
import { BtnAccion } from "../common/BtnAccion.jsx";

const ModalEditarProducto = ({ isOpen, onClose, producto, onProductoActualizado }) => {
    const { token } = useAuth();
    const { ejecutarPeticion, isLoading, error: apiError, setError: setApiError } = useApi();

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
        defaultValues: {
            nombre_producto: "",
            precio: "",
            descripcion: "",
            categoria: "",
            condicion: "",
            bateria: "",
            capacidad: []
        }
    });

    // 2. Estado para el control visual e individual de las 3 imágenes (Slots)
    const [imagenesSlots, setImagenesSlots] = useState([
        { tipo: 'vacio', url: null, file: null },
        { tipo: 'vacio', url: null, file: null },
        { tipo: 'vacio', url: null, file: null }
    ]);

    // 3. Pre-cargamos los datos cuando se abre el modal con un producto
    useEffect(() => {
        if (producto && isOpen) {
            // A. Cargamos datos de texto y array de capacidades
            const capacidadArray = producto.capacidad || [];

            reset({
                nombre_producto: producto.nombre_producto || "",
                precio: producto.precio || "",
                descripcion: producto.descripcion || "",
                categoria: producto.categoria || "",
                condicion: producto.condicion || "",
                bateria: producto.bateria || "",
                capacidad: capacidadArray,
            });

            // B. Cargamos las imágenes existentes en sus respectivos slots
            const slotsBase = [
                { tipo: 'vacio', url: null, file: null },
                { tipo: 'vacio', url: null, file: null },
                { tipo: 'vacio', url: null, file: null }
            ];

            let urlsViejas = [];
            if (Array.isArray(producto.imagen_url)) {
                urlsViejas = producto.imagen_url;
            } else if (typeof producto.imagen_url === 'string') {
                try {
                    urlsViejas = JSON.parse(producto.imagen_url || "[]");
                } catch (e) {
                    urlsViejas = [];
                }
            }

            urlsViejas.forEach((url, i) => {
                if (i < 3 && url) {
                    slotsBase[i] = { tipo: 'original', url: url, file: null };
                }
            });

            setImagenesSlots(slotsBase);
            setApiError(null);
        }
    }, [producto, isOpen, reset, setApiError]);

    if (!isOpen) return null;

    // Observamos categoría para mostrar/ocultar especificaciones técnicas
    const categoriaActual = watch("categoria");
    const capacidadesSeleccionadas = watch("capacidad") || [];
    const mostrarCamposTech = ["celulares", "tablets", "iphones", "smartphones", "ipad"].includes(categoriaActual?.toLowerCase());

    // --- MANEJO DE CAPACIDADES ---
    const handleCapacidadToggle = (cap) => {
        const current = getValues("capacidad") || [];
        const yaSeleccionada = current.includes(cap);

        const nuevasCapacidades = yaSeleccionada
            ? current.filter(c => c !== cap)
            : [...current, cap];

        setValue("capacidad", nuevasCapacidades, { shouldValidate: true });
    };

    // --- MANEJO DE SLOTS DE IMÁGENES ---
    const handleCambiarImagen = (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const nuevosSlots = [...imagenesSlots];
        nuevosSlots[index] = {
            tipo: 'nueva',
            url: URL.createObjectURL(file), // Permite la previsualización al instante
            file: file
        };
        setImagenesSlots(nuevosSlots);

        // Reseteamos el input file para que permita volver a seleccionar el mismo archivo si es necesario
        e.target.value = null;
    };

    const handleEliminarImagen = (index) => {
        const nuevosSlots = [...imagenesSlots];
        nuevosSlots[index] = { tipo: 'vacio', url: null, file: null };
        setImagenesSlots(nuevosSlots);
    };

    // --- ENVÍO DEL FORMULARIO ---
    const onSubmit = async (data) => {
        setApiError(null);
        const formData = new FormData();

        // 1. Agregamos los campos de texto
        if (data.nombre_producto) formData.append("nombre_producto", data.nombre_producto);
        if (data.precio) formData.append("precio", data.precio);
        if (data.categoria) formData.append("categoria", data.categoria);
        if (data.condicion) formData.append("condicion", data.condicion);
        if (data.descripcion) formData.append("descripcion", data.descripcion);

        // 2. Agregamos las capacidades
        if (data.capacidad && data.capacidad.length > 0) {
            data.capacidad.forEach(cap => {
                formData.append("capacidad", cap);
            });
        }

        // 3. Batería (solo si aplica)
        if (mostrarCamposTech && data.bateria) {
            formData.append("bateria", data.bateria);
        }

        // 4. EL MAPA DE IMÁGENES
        const layout = [];
        imagenesSlots.forEach(slot => {
            if (slot.tipo === 'original') {
                layout.push(slot.url); // Le decimos al backend "conserva esta"
            } else if (slot.tipo === 'nueva') {
                layout.push('NUEVA_IMAGEN'); // acá va la foto nueva
                formData.append("imagen_url", slot.file); // Adjuntamos el archivo
            }

        });

        formData.append("layout_imagenes", JSON.stringify(layout));

        // 5. Enviamos la petición
        const result = await ejecutarPeticion(`productos/actualizar-producto/${producto.id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });


        if (result.exito) {
            const datosActualizados = { ...data };

            let nuevasImagenes = result.data.productoActualizado?.imagen_url;
            //verifica si las nuevas imagenes son un string si lo son las transformamos a un arreglo
            if (typeof nuevasImagenes === 'string') {
                try {
                    nuevasImagenes = JSON.parse(nuevasImagenes);
                } catch (e) {
                    nuevasImagenes = [];
                }
            }
            datosActualizados.imagen_url = nuevasImagenes || producto.imagen_url;

            onProductoActualizado(producto.id, datosActualizados);
            onClose();
        } else {
            setApiError(result.error || "No se pudo actualizar el producto.");
        }
    };

    const labelStyle = "form-label text-muted small fw-bold text-uppercase mb-1";

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "12px" }}>

                    {/* HEADER */}
                    <div className="modal-header border-bottom-0 pt-4 px-4 pb-2">
                        <h5 className="modal-title fw-bold fs-4">Editar Producto</h5>
                        <button type="button" className="btn-close shadow-none" onClick={onClose} />
                    </div>

                    {/* BODY */}
                    <div className="modal-body px-4 py-3">
                        {apiError && <div className="alert alert-danger rounded-3 shadow-sm">{apiError}</div>}

                        <form onSubmit={handleSubmit(onSubmit)} id="formEditarProducto">

                            {/* --- SECCIÓN 1: INFO BÁSICA --- */}
                            <div className="mb-4">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                                    <i className="bi bi-pencil-square me-2"></i>Información General
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <InputGenerico
                                            label="Nombre del Producto"
                                            name="nombre_producto"
                                            register={register}
                                            errors={errors.nombre_producto}
                                            reglas={{
                                                minLength: { value: 3, message: "Mínimo 3 caracteres" },
                                                maxLength: { value: 50, message: "Máximo 50 caracteres" }
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <InputGenerico
                                            label="Precio ($)"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="precio"
                                            register={register}
                                            errors={errors.precio}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className={labelStyle}>Categoría</label>
                                        <select
                                            className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                                            {...register("categoria")}
                                        >
                                            <option value="">Seleccione...</option>
                                            {categoriasValidas.map(cat => (
                                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className={labelStyle}>Condición</label>
                                        <select
                                            className={`form-select ${errors.condicion ? 'is-invalid' : ''}`}
                                            {...register("condicion")}
                                        >
                                            <option value="">Seleccione...</option>
                                            {CONDICIONES_PERMITIDAS.map(cond => (
                                                <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
                                            ))}
                                        </select>
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
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- SECCIÓN 3: GESTOR DE IMÁGENES Y DESCRIPCIÓN --- */}
                            <div className="mb-2">
                                <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                                    <i className="bi bi-images me-2"></i>Gestión de Imágenes y Detalles
                                </h6>

                                <div className="mt-3">
                                    <label className={labelStyle}>Descripción</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        maxLength="500"
                                        placeholder="Escribe los detalles y características del producto..."
                                        {...register("descripcion")}
                                    />
                                </div>

                                <div className="d-flex gap-3 justify-content-center mb-4 mt-3">
                                    {imagenesSlots.map((slot, i) => (
                                        <div key={i} className="position-relative border rounded-3 bg-light d-flex flex-column align-items-center justify-content-center overflow-hidden shadow-sm" style={{ width: "120px", height: "120px" }}>

                                            {slot.tipo === 'vacio' ? (
                                                <label className="w-100 h-100 d-flex flex-column align-items-center justify-content-center m-0" style={{ cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.classList.add('bg-white')} onMouseOut={(e) => e.currentTarget.classList.remove('bg-white')}>
                                                    <i className="bi bi-plus-circle fs-2 text-secondary mb-1"></i>
                                                    <span className="small text-muted fw-semibold">Agregar</span>
                                                    <input type="file" className="d-none" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleCambiarImagen(e, i)} />
                                                </label>
                                            ) : (
                                                <>
                                                    <img src={slot.url} alt={`Preview ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                                                    {/* Botón flotante para CAMBIAR */}
                                                    <label className="position-absolute m-1 bg-white rounded-circle shadow d-flex align-items-center justify-content-center" style={{ top: "4px", left: "4px", width: "30px", height: "30px", cursor: "pointer", opacity: "0.95" }}>
                                                        <i className="bi bi-pencil-fill text-primary" style={{ fontSize: "13px" }}></i>
                                                        <input type="file" className="d-none" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleCambiarImagen(e, i)} />
                                                    </label>

                                                    {/* Botón flotante para ELIMINAR */}
                                                    <button type="button" onClick={() => handleEliminarImagen(i)} className="position-absolute m-1 bg-white rounded-circle shadow d-flex align-items-center justify-content-center border-0" style={{ top: "4px", right: "4px", width: "30px", height: "30px", opacity: "0.95" }}>
                                                        <i className="bi bi-trash-fill text-danger" style={{ fontSize: "13px" }}></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-top-0 px-4 pb-4 pt-0">
                        <BtnAccion
                            type="button"
                            onClick={onClose}
                            textoDefault="Cancelar"
                            iconoDefault=""
                            colorDefault="btn-light border"
                            isFullWidth={false}
                            className="px-4"
                        />
                        <BtnAccion
                            type="submit"
                            form="formEditarProducto"
                            isLoading={isLoading}
                            textoDefault="Guardar Cambios"
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

export default ModalEditarProducto;