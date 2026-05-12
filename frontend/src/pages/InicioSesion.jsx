import React, { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import "../style/Registro.css";


const InicioSesion = () => {
    
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("Datos enviados:", data);
    };

    return (
        <Fragment>
            <div className=" registro-wrapper d-flex flex-column align-items-center justify-content-center p-3 ">
                

                <div className=" registro-card p-4 p-md-5 m-4">

                    <div className="text-bienvenida d-flex flex-column align-items-center justify-content-center m-4 gap-3">
                        <h3 className=" registro-title text-center fs-3 text-dark fw-semibold">Bienvenido de nuevo</h3>
                        <p className="text-center registro-subtitle fs-6">Inicio sesión para gestionar tus pedidos y la garantía.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* Email Field */}
                        <div className="mb-3 text-start">
                            <label htmlFor="email" className=" form-label  registro-label">Dirección de correo electrónico</label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                id="email"
                                placeholder="name@example.com"
                                // 2. Nueva forma de registrar el input
                                {...register("email", 
                                    {
                                    required: "El correo electrónico es requerido",
                                    pattern: {
                                        value: true,
                                        message: "Dirección de correo no válida"
                                    }
                                })}
                            />
                            {errors.email && (
                                <span className="text-danger text-small d-block mt-1">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="mb-3">
                            <div className="row">
                                <div className="col-4 text-start">
                                    <label htmlFor="password" className="form-label  registro-label ">Contraseña</label>
                                </div>
                                <div className="col-8 text-end">
                                    <a href="#" className="fw-light registro-link text-decoration-none ">¿Olvidaste tu contraseña?</a>
                                </div>
                            </div>

                            <input
                                type="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                                id="password"
                                placeholder="Introduce tu contraseña"
                                {...register("password", {
                                    required: "La contraseña es requerida",
                                    minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                })}
                            />
                            {errors.password && (
                                <span className="text-danger text-small d-block mt-1 text-start">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" className="btn-registro w-100 mb-3">Iniciar sesión</button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-3">
                    <span className="badge-seguro fs-6">
                        <i class="bi bi-shield-lock "></i>
                        INICIO SESION SEGURO
                    </span>
                </div>

                <div className="d-flex align-self-center justify-content-center gap-2 mt-4">
                    <p className="text-center text-muted mb-3" style={{ fontSize: "0.9rem" }}>¿No tienes una cuenta?</p>
                    <a href="#" className="ms-2  registro-link">Crear cuenta</a>
                </div>
            </div>
        </Fragment>
    );
}

export default InicioSesion;