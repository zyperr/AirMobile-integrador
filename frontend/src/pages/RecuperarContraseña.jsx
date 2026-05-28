import React, { useState } from "react";
import { set, useForm, Watch } from "react-hook-form";
import { InputGenerico } from "../components/common/InputGenerico";
import { BtnForm } from "../components/common/BtnForm";
import { useApi } from "../hooks/useApi";
import { ErrorCard } from "../components/common/ErrorCard";
import { Link } from "react-router-dom";
import InputPassword from "../components/common/InputPassword";
import { PasswordStrengthBar } from "../components/common/PasswordStrengthBar";
import { SuccessCard } from "../components/common/SuccessCard";
export const RecuperarContraseña = () => {
    const [saveEmail, setSaveEmail] = useState("")
    const [paso, setPaso] = useState(1)
    const { ejecutarPeticion, isLoading, error } = useApi()


    const { register, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const passwordActual = watch("password", "")

    const endpointRecuperar = "recuperar-password/"
    const endpointReset = "reset-password/"


    const onSubmitEmail = async (data) => {
        // Asumiendo que tu endpoint se llama así
        const resultado = await ejecutarPeticion(endpointRecuperar, {
            method: "POST",
            body: JSON.stringify({ email: data.email })
        });

        if (resultado.exito) {
            setSaveEmail(data.email);
            setPaso(2); // Pasamos a la siguiente pantalla
        }
    };

    const onSubmitNuevaClave = async (data) => {
        console.log(data)
        const payload = {
            email: saveEmail,
            codigo: data.codigo,
            nuevaPassword: data.password
        }
        console.log(payload)
        const resultado = await ejecutarPeticion(endpointReset, {
            method: "POST",
            body: JSON.stringify(payload)
        })
        if (resultado.exito) {
            setPaso(3)
        }
    }

    if (paso === 3) {
        return <SuccessCard
            mensaje="¡Contraseña actualizada!"
            descripcion="Tu contraseña ha sido cambiada exitosamente. Ya podés iniciar sesión con tu nueva clave."
            linkTo="/inicio-sesion"
            text="Ir a Iniciar Sesión"
        />;
    }
    return (
        <section className="wrapper flex flex-column flex-column align-items-center justify-content-center gap-3">
            <article className="d-flex flex-column gap-5 d-card p-4 p-md-5 m-4 rounded">
                <div>
                    <h3 className="fs-2 mb-3">Recuperar Contraseña</h3>
                    <p className="text-center subtitle fs-6">
                        {
                            paso === 1
                                ? "Porfavor ingrese su correo electronico para recibir un codigo de 6 digitos"
                                : `Ingrese el codigo que enviamos a ${saveEmail}`
                        }
                    </p>
                </div>
                {error && <ErrorCard errorServidor={error} />}
                {paso === 1 && (
                    <form className="d-flex flex-column gap-2" onSubmit={handleSubmit(onSubmitEmail)}>
                        <InputGenerico
                            label="Correo electrónico"
                            name="email"
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            register={register}
                            errors={errors.email}
                            reglas={{
                                required: "El correo es requerido",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Correo no valido"
                                }
                            }}
                        />
                        <BtnForm isSubmitting={isSubmitting} text={"Enviar codigo"} />
                    </form>
                )}
                {
                    paso === 2 && (
                        <form onSubmit={handleSubmit(onSubmitNuevaClave)}>
                            <InputGenerico
                                label="Código de verificación"
                                name="codigo"
                                type="text"
                                placeholder="Ej: 123456"
                                register={register}
                                errors={errors.codigo}
                                reglas={{
                                    required: "El código es requerido",
                                    minLength: { value: 6, message: "El código debe tener 6 dígitos" },
                                    maxLength: { value: 6, message: "El código debe tener 6 dígitos" }
                                }}
                            />

                            <InputPassword
                                label="Nueva contraseña"
                                name="password"
                                placeholder="••••••••"
                                register={register}
                                errors={errors.password}
                                reglas={{
                                    required: "La contraseña es requerida.",
                                    minLength: { value: 6, message: "Mínimo 6 caracteres." },
                                    validate: {
                                        mayuscula: value => /[A-Z]/.test(value) || "Debe contener al menos una mayúscula.",
                                        numero: value => /[0-9]/.test(value) || "Debe contener al menos un número."
                                    }
                                }}
                            />

                            {passwordActual && <PasswordStrengthBar password={passwordActual} />}

                            <InputPassword
                                label="Confirmar nueva contraseña"
                                name="confirmarPassword"
                                placeholder="••••••••"
                                register={register}
                                errors={errors.confirmarPassword}
                                reglas={{
                                    required: "Por favor confirmá tu contraseña.",
                                    validate: value => value === passwordActual || "Las contraseñas no coinciden."
                                }}
                            />

                            <BtnForm isSubmitting={isLoading} text="Cambiar Contraseña" />

                            {/* Botón opcional para volver atrás por si se equivocó de mail */}
                            <div className="text-center mt-3">
                                <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setPaso(1)}>
                                    Usar otro correo electrónico
                                </button>
                            </div>
                        </form>
                    )}
                <p className="text-center text-muted mt-4 mb-3 " style={{ fontSize: "0.9rem" }}>
                    <Link className="registro-link text-decoration-none" to="/inicio-sesion"> Volver al Login </Link>
                </p>
            </article>
        </section>
    )
}