import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";
import InputPassword from "../../common/InputPassword";
import { useOutletContext } from "react-router-dom"; 

const Seguridad = () => {
    const { setNotificacion } = useOutletContext(); 

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const contraseñaNueva = watch("newPassword");
    
    // 1. Extraemos el error de red de useApi
    const { ejecutarPeticion: actualizarPassword, isLoading: guardandoPassword, error: errorRed } = useApi();
    
    // 2. Nuevo estado local para capturar los mensajes de error del backend
    const [errorLocal, setErrorLocal] = useState(null);

    const onSubmitNuevaClave = async (data) => {
        // Limpiamos los errores cada vez que el usuario vuelve a intentar
        setErrorLocal(null);
        
        const response = await actualizarPassword('usuarios/actualizar', {
            method: 'PUT',
            body: JSON.stringify({ password: data.newPassword }) 
        });

        if (response.exito) {
            reset();
            setNotificacion({
                mostrar: true,
                mensaje: "¡Seguridad al día!",
                descripcion: "Tu contraseña ha sido actualizada con éxito."
            });
        } else {
            // 3. Guardamos el error devuelto por el servidor para mostrarlo en la interfaz
            setErrorLocal(response.message || "No se pudo actualizar la contraseña. Inténtalo de nuevo.");
        }
    }

    return (
        <section className="mb-5 slide-down-animation">
            <h3 className="fs-4 fw-bold mb-3">Seguridad</h3>
            <div className="bg-light p-4 rounded-3">
                <h5 className="fs-6 fw-bold mb-4">Cambiar Contraseña</h5>
                <form onSubmit={handleSubmit(onSubmitNuevaClave)}>
                    
                    <div className="mb-3">
                        <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px" }}>Nueva Contraseña</label>
                        <InputPassword
                            label="Nueva contraseña"
                            name="newPassword"
                            placeholder="••••••••"
                            register={register}
                            errors={errors.newPassword}
                            reglas={{
                                required: "La contraseña es requerida.",
                                minLength: { value: 8, message: "Mínimo 8 caracteres." },
                                validate: {
                                    mayuscula: value => /[A-Z]/.test(value) || "Debe contener al menos una mayúscula.",
                                    numero: value => /[0-9]/.test(value) || "Debe contener al menos un número."
                                }
                            }}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px" }}>Confirmar Nueva Contraseña</label>
                        <InputPassword
                            label="Confirmar nueva contraseña"
                            name="confirmPassword"
                            placeholder="••••••••"
                            register={register}
                            errors={errors.confirmPassword}
                            reglas={{
                                required: "La confirmación es requerida.",
                                validate: value => value === contraseñaNueva || "Las contraseñas no coinciden."
                            }}
                        />
                    </div>

                    {/* ========================================== */}
                    {/* 4. BLOQUE DE ERROR VISUAL DE LA API          */}
                    {/* ========================================== */}
                    {(errorRed || errorLocal) && (
                        <div className="text-danger mb-3 fw-medium text-end slide-down-animation" style={{ fontSize: "13px" }}>
                            <i className="bi bi-exclamation-triangle-fill me-1"></i> 
                            {errorRed || errorLocal}
                        </div>
                    )}

                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-outline-primary px-4 py-2 fw-semibold" disabled={guardandoPassword}>
                            {guardandoPassword ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Actualizando...</>
                            ) : ("Actualizar Contraseña")}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default Seguridad;