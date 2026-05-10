import React, { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import "../style/inicioSesion.css";


const InicioSesion = () => {
    
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data) => {
        console.log("Datos enviados:", data);
    };

    return (
        <Fragment>
            <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
                <div className="text-bienvenida d-flex flex-column align-items-center justify-content-center mb-3">
                    <h3 className="text-center fs-3">Bienvenido de nuevo.</h3>
                    <p className="text-center text-primary-emphasis">Inicio sesión para gestionar tus pedidos y la garantía.</p>
                </div>

                <div className="formulario p-5 rounded-4 shadow-sm border">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        
                        {/* Email Field */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label text-secondary-emphasis">Dirección de correo electrónico</label>
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
                                <div className="col-4">
                                    <label htmlFor="password" className="form-label fs-6 text-secondary-emphasis">Contraseña</label>
                                </div>
                                <div className="col-8 text-end">
                                    <a href="#" className="fs-6 fw-light text-primary text-decoration-none ">¿Olvidaste tu contraseña?</a>
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
                                <span className="text-danger text-small d-block mt-1">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-dark fs-6">Iniciar sesión</button>
                        </div>
                    </form>
                </div>

                <div className="d-flex justify-content-center mt-3 mb-3">
                    <div className="d-inline-flex pe-2 ps-2 fs-6 gap-1 rounded-pill text-primary-emphasis bg-secondary bg-opacity-25">
                        <i className="bi bi-lock"></i>
                        <p className="mb-0 text-uppercase" style={{fontSize: '12px', alignSelf: 'center'}}>inicio de sesión seguro</p>
                    </div>
                </div>

                <div className="d-flex align-self-center justify-content-center gap-2 mt-4 text-center text-primary-emphasis">
                    <p className="mb-0">¿No tienes una cuenta? 
                        <a href="#" className="ms-2  text-primary-emphasis text-opacity-25">Crear cuenta</a>
                    </p>
                </div>
            </div>
        </Fragment>
    );
}

export default InicioSesion;