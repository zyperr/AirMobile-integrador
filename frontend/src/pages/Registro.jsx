import { useState } from "react";
import "../style/Registro.css";
import { Link } from "react-router-dom";
import { InputGenerico } from "../components/InputGenerico";
import InputPassword from "../components/InputPassword";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";
import { SuccessCard } from "../components/SuccessCard";
import { BadgeSeguro } from "../components/BadgeSeguro";
import { BtnForm } from "../components/BtnForm";
import { useForm } from "react-hook-form";


const Registro = () => {
    const [submitted, setSubmitted] = useState(false);

    // Inicializamos React Hook Form
    const {
        register,
        handleSubmit,
        watch, 
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    // "Observamos" la contraseña en tiempo real para la barrita y para comparar
    const passwordActual = watch("password", "");

    const url = "http://localhost:3000/api/usuarios/registro";

    // data ya trae todos los campos validados!
    const onSubmit = async (data) => {
        try {
            // Limpiamos lo que no va a la DB (confirmarPassword)
            const formParsed = {
                email: data.email,
                nombre: data.nombre,
                password: data.password
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formParsed)
            });
            const result = await response.json();

            if (response.ok) {
                setSubmitted(true);
                reset(); // Limpia todo el formulario automáticamente
            } else {
                console.log(result.message);
            }
        } catch (error) {
            console.log("Error", error);
        }
    };
    if (submitted) {
        return <SuccessCard linkTo={"/inicio-sesion"} text={"Ir a login"} setSubmitted={setSubmitted} mensaje={"¡Cuenta creada!"} descripcion={"Tu cuenta fue creada exitosamente. Ya podés iniciar sesión."} />
    }
    console.log(passwordActual)
    return (
        <div className="registro-wrapper">
            <div className="registro-card p-4 p-md-5">

                <div className="text-center mb-4">
                    <h1 className="registro-title mb-2">Crea tu cuenta</h1>
                    <p className="registro-subtitle">Únete a nuestra comunidad para disfrutar de acceso exclusivo a los <span className="fw-semibold" style={{ color: "#1a3a6b" }}>mejores iPhone de segunda mano certificados.</span></p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ textAlign: "left" }}>

                    <InputGenerico
                        label="Nombre completo"
                        name="nombre"
                        placeholder="John Gomez"
                        register={register}
                        errors={errors.nombre}
                        reglas={{
                            required: "El nombre completo es requerido.",
                            minLength: { value: 3, message: "El nombre debe tener al menos 3 caracteres." }
                        }}
                    />

                    <InputGenerico
                        label="Dirección de correo electrónico"
                        name="email"
                        type="email"
                        placeholder="ejemplo21@gmail.com"
                        register={register}
                        errors={errors.email}
                        reglas={{
                            required: "El correo electrónico es requerido.",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Ingresá un correo electrónico válido."
                            }
                        }}
                    />

                    <InputPassword
                        label="Contraseña"
                        name="password"
                        placeholder="••••••••"
                        register={register}
                        errors={errors.password}
                        reglas={{
                            required: "La contraseña es requerida.",
                            minLength: { value: 6, message: "La contraseña debe tener al menos 6 caracteres." },
                            validate: { // Validaciones personalizadas para mayúsculas y números
                                mayuscula: value => /[A-Z]/.test(value) || "Debe contener al menos una mayúscula.",
                                numero: value => /[0-9]/.test(value) || "Debe contener al menos un número."
                            }
                        }}
                    />

                    {/* Le pasamos lo que "observa" React Hook Form a la barrita */}
                    {passwordActual && (
                        <PasswordStrengthBar password={passwordActual} />
                    )}

                    <InputPassword
                        label="Confirmar contraseña"
                        name="confirmarPassword"
                        placeholder="••••••••"
                        register={register}
                        errors={errors.confirmarPassword}
                        reglas={{
                            required: "Por favor confirmá tu contraseña.",
                            // Comparamos contra el passwordActual que estamos observando
                            validate: value => value === passwordActual || "Las contraseñas no coinciden."
                        }}
                    />

                    {/* Botón adaptado al estado isSubmitting (Loading) */}
                    <BtnForm isSubmitting={isSubmitting} text={"Crear cuenta"} />
                </form>

                <p className="text-center text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                    <Link className="registro-link" to="/inicio-sesion" > ¿Ya tienes una cuenta? </Link>
                </p>
                <BadgeSeguro mensaje={"REGISTRO SEGURO"} />
            </div>
        </div>
    );
};

export default Registro;





