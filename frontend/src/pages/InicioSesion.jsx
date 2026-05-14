import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import "../style/Registro.css";
import { ErrorCard } from '../components/ErrorCard';
import { InputGenerico } from '../components/InputGenerico';
import InputPassword from '../components/InputPassword';
import { BtnForm } from '../components/BtnForm';
import { BadgeSeguro } from '../components/BadgeSeguro';
import { Link } from 'react-router-dom';
import { SuccessCard } from '../components/SuccessCard';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const InicioSesion = () => {
    const [loginExitoso, setLoginExitoso] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { ejecutarPeticion, isLoading, error } = useApi();


    const { login } = useAuth();
    const endpoint = "usuarios/login";

    const onSubmit = async (data) => {

        const resultado = await ejecutarPeticion(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        })
        if (resultado.exito) {
            setLoginExitoso(true);
            console.log("¡Login exitoso!", resultado.data);


            login(resultado.data.token);
            setTimeout(() => { window.location.href = "/"; }, 3000);
        }
    };


    return (
        <Fragment>
            <div className="registro-wrapper d-flex flex-column align-items-center justify-content-center p-3 gap-3">

                {
                    !loginExitoso ? (
                        <div className="registro-card p-4 p-md-5 m-4 text-center">
                            <div className="text-bienvenida d-flex flex-column align-items-center justify-content-center m-4 gap-3">
                                <h3 className="registro-title text-center fs-3 text-dark fw-semibold">Bienvenido de nuevo</h3>
                                <p className="text-center registro-subtitle fs-6">Inicia sesión para gestionar tus pedidos.</p>
                                {/* --- CARTEL DE ERROR ESTÉTICO --- */}
                                {error && (
                                    <ErrorCard errorServidor={error} />
                                )}
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <InputGenerico
                                        label="Correo electrónico"
                                        name="email"
                                        type="email"
                                        placeholder="nombre@ejemplo.com"
                                        register={register}
                                        errors={errors.email}
                                        reglas={{
                                            required: "El correo es requerido",
                                            pattern: {
                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                message: "Formato no válido"
                                            }
                                        }}
                                    />
                                    <InputPassword
                                        label="Contraseña"
                                        name="password"
                                        placeholder="Tu contraseña"
                                        register={register}
                                        errors={errors.password}
                                        linkRecuperacion="/recuperar-password" /* Le pasamos la ruta para recuperar la clave */
                                        reglas={{
                                            required: "La contraseña es requerida",
                                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                        }}
                                    />

                                    <BtnForm isSubmitting={isSubmitting} text={"iniciar sesion"} />
                                </form>
                                <BadgeSeguro mensaje={"INICIO SESIÓN SEGURO"} />
                                <p className="text-center text-muted mt-2" style={{ fontSize: "0.9rem" }}>
                                    ¿No tienes una cuenta?
                                    <Link className="registro-link text-decoration-none" to="/registro" > Crear una</Link>
                                </p>
                            </div>
                        </div>

                    ) : (
                        /* --- VISTA DE ÉXITO ESTÉTICA --- */
                        <SuccessCard
                            descripcion={"Mira todos nuestros productos disponibles."}
                            mensaje={"¡Ingreso Exitoso!"}
                            linkTo={"/catalogo"}
                            text={"ir a catalogo"}
                            setSubmitted={setSubmitted}
                        />

                    )
                }
            </div>

        </Fragment>
    );
}

export default InicioSesion;