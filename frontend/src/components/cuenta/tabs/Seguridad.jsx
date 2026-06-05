import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";
import InputPassword from "../../common/InputPassword";
import { useOutletContext } from "react-router-dom"; // 👈 1. Importamos esto

const Seguridad = () => {
    // 👈 2. Extraemos la función de notificación del padre
    const { setNotificacion } = useOutletContext(); 

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const contraseñaNueva = watch("newPassword");
    const { ejecutarPeticion: actualizarPassword, isLoading: guardandoPassword } = useApi();

    const onSubmitNuevaClave = async (data) => {
        console.log("Intentando enviar al backend:", { password: data.newPassword });
        
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
            // Te sugiero imprimir el error para verlo en consola más fácil
            console.error("El backend rechazó la petición:", response.error);
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