import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../context/AuthContext";
import { InputGenerico } from "../../common/InputGenerico";
import InputPassword from "../../common/InputPassword";
import { PasswordStrengthBar } from "../../common/PasswordStrengthBar";

const ModalRegistrarAdmin = ({ isOpen, onClose, onAdminAgregado }) => {

    const { token } = useAuth();
    const { ejecutarPeticion, isLoading } = useApi();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setError,
        formState: { errors }
    } = useForm();

    const passwordActual = watch("password", "");

    if (!isOpen) return null;

    const onSubmit = async (data) => {
        const dataParsed = {
            nombre: data.nombre,
            email: data.email,
            password: data.password
        };

        const result = await ejecutarPeticion("staff/registrar", {
            method: "POST",
            body: JSON.stringify(dataParsed)
        });

        if (result.exito) {
            reset();
            onClose();
            onAdminAgregado(); // ← dispara el Toast y recarga la lista desde Administracion
        } else {
            // Mostramos el error del servidor debajo del email
            setError("email", {
                type: "server",
                message: result.error || "No se pudo registrar el administrador."
            });
        }
    };

    return (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    {/* HEADER */}
                    <div className="modal-header">
                        <h5 className="modal-title">Añadir Administrador</h5>
                        <button type="button" className="btn-close" onClick={() => { reset(); onClose(); }} />
                    </div>

                    {/* BODY */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit(onSubmit)} id="formRegistrarAdmin">
                            <div className="row g-2">

                                {/* Nombre */}
                                <div className="col-12">
                                    <InputGenerico
                                        label="Nombre"
                                        name="nombre"
                                        type="text"
                                        placeholder="Nombre completo"
                                        register={register}
                                        reglas={{
                                            required: "El nombre es obligatorio.",
                                            minLength: { value: 3, message: "Mínimo 3 caracteres." },
                                            maxLength: { value: 50, message: "Máximo 50 caracteres." }
                                        }}
                                        errors={errors.nombre}
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-12">
                                    <InputGenerico
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        register={register}
                                        reglas={{
                                            required: "El email es obligatorio.",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Ingresá un email válido."
                                            }
                                        }}
                                        errors={errors.email}
                                    />
                                </div>

                                {/* Contraseña */}
                                <div className="col-12">
                                    <InputPassword
                                        label="Contraseña"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                        register={register}
                                        reglas={{
                                            required: "La contraseña es obligatoria.",
                                            minLength: { value: 8, message: "Mínimo 8 caracteres." }
                                        }}
                                        errors={errors.password}
                                    />
                                    {passwordActual && (
                                        <PasswordStrengthBar password={passwordActual} />
                                    )}
                                </div>

                                {/* Confirmar Contraseña */}
                                <div className="col-12">
                                    <InputPassword
                                        label="Confirmar Contraseña"
                                        name="confirmarPassword"
                                        placeholder="Repetí la contraseña"
                                        register={register}
                                        reglas={{
                                            required: "Por favor confirmá tu contraseña.",
                                            validate: (value) =>
                                                value === passwordActual || "Las contraseñas no coinciden."
                                        }}
                                        errors={errors.confirmarPassword}
                                    />
                                    {watch("confirmarPassword") && (
                                        <PasswordStrengthBar password={watch("confirmarPassword")} />
                                    )}
                                </div>

                            </div>
                        </form>
                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { reset(); onClose(); }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="formRegistrarAdmin"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Guardando..." : "Añadir Administrador"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalRegistrarAdmin;