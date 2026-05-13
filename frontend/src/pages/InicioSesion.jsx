import React, { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import "../style/Registro.css";
import {Link} from 'react-router-dom';

const InicioSesion = () => {
    const [errorServidor, setErrorServidor] = useState(null);
    const [loginExitoso, setLoginExitoso] = useState(false); 
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const url = "http://localhost:3000/api/usuarios/login";

    const onSubmit = async (data) => {
        setErrorServidor(null); 
        await enviarDatos(data);
    };

    const enviarDatos = async (data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                setLoginExitoso(true);
                console.log("Éxito:", result);
                
                // Ejemplo: Redirigir al home después de 3 segundos
                // setTimeout(() => { window.location.href = "/"; }, 3000);
            } else {
                setErrorServidor(result.message || "Correo o contraseña incorrectos.");
            }
        } catch (error) {
            setErrorServidor("Error de conexión con el servidor.");
        }
    };

    return (
        <Fragment>
            <div className="registro-wrapper d-flex flex-column align-items-center justify-content-center p-3">
                
                <div className="registro-card p-4 p-md-5 m-4 text-center"> {/* Agregado text-center para el éxito */}

                    {!loginExitoso ? (
                        <>
                            <div className="text-bienvenida d-flex flex-column align-items-center justify-content-center m-4 gap-3">
                                <h3 className="registro-title text-center fs-3 text-dark fw-semibold">Bienvenido de nuevo</h3>
                                <p className="text-center registro-subtitle fs-6">Inicia sesión para gestionar tus pedidos.</p>
                            </div>

                            {errorServidor && (
                                <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm mb-4" role="alert" style={{ borderRadius: '10px', fontSize: '0.9rem', textAlign: 'left' }}>
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <div>{errorServidor}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="mb-3 text-start">
                                    <label htmlFor="email" className="form-label registro-label">Correo electrónico</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        placeholder="nombre@ejemplo.com"
                                        {...register("email", {
                                            required: "El correo es requerido",
                                            pattern: {
                                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                                message: "Formato no válido"
                                            }
                                        })}
                                    />
                                    {errors.email && <span className="text-danger text-small d-block mt-1">{errors.email.message}</span>}
                                </div>

                                <div className="mb-3">
                                    <div className="row">
                                        <div className="col-5 text-start">
                                            <label htmlFor="password" className="form-label registro-label">Contraseña</label>
                                        </div>
                                        <div className="col-7 text-end">
                                            <Link to= "/" className="fw-light registro-link text-decoration-none" style={{fontSize: '0.9rem'}} >¿Olvidaste tu contraseña?</Link>
                                        </div>
                                    </div>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                                        id="password"
                                        placeholder="Tu contraseña"
                                        {...register("password", {
                                            required: "La contraseña es requerida",
                                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                        })}
                                    />
                                    {errors.password && <span className="text-danger text-small d-block mt-1 text-start">{errors.password.message}</span>}
                                </div>

                                <div className="d-grid gap-2">
                                    <button 
                                        type="submit" 
                                        className="btn-registro w-100 mb-3"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        ) : "Iniciar sesión"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* --- VISTA DE ÉXITO ESTÉTICA --- */
                        <div className="py-4 animate__animated animate__fadeIn d-flex flex-column align-items-center">
                            <div className="mb-4">
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "5rem" }}></i>
                            </div>
                            <h3 className="fw-bold text-dark">¡Ingreso Exitoso!</h3>
                            <p className="text-muted">Mira todos nuestros productos disponibles.</p>
                            <Link to="/catalogo" className='btn-registro w-100 mb-3 text-decoration-none'>
                            Ir Catálogo
                            </Link>


                        </div>
                    )}
                </div>

                {/* Este bloque se muestra siempre para mantener la estructura, o puedes ocultarlo si prefieres */}
                {!loginExitoso && (
                    <div className="text-center mt-3">
                        <span className="badge-seguro fs-6">
                            <i className="bi bi-shield-lock"></i> INICIO SESIÓN SEGURO
                        </span>
                    </div>
                )}
            </div>
        </Fragment>
    );
}

export default InicioSesion;