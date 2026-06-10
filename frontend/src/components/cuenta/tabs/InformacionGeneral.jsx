import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";
import { InputGenerico } from "../../common/InputGenerico";

const InformacionGeneral = () => {
    // 1. Extraemos las herramientas
    const { datosUsuario, setDatosUsuario, setNotificacion } = useOutletContext();

    // 2. Estados locales
    const [nombre, setNuevoNombre] = useState(datosUsuario.nombre);
    const [correo, setNuevoCorreo] = useState(datosUsuario.email);
    const [codigo, setCodigo] = useState("");
    const [correoVerificado, setCorreoVerificado] = useState(datosUsuario.verificado || false);

    // 3. Extraemos 'error' de cada llamada a useApi
    const { ejecutarPeticion: actualizarNombre, isLoading: guardandoNombre, error: errorNombre } = useApi();
    const { ejecutarPeticion: actualizarCorreo, isLoading: guardandoCorreo, error: errorCorreo } = useApi();
    const { ejecutarPeticion: peticionVerificarCodigo, isLoading: guardandoCodigo, error: errorCodigo } = useApi();

    // 4. Estados para manejar errores de validación del backend (ej: correo duplicado, código inválido)
    const [errorLocalNombre, setErrorLocalNombre] = useState(null);
    const [errorLocalCorreo, setErrorLocalCorreo] = useState(null);
    const [errorLocalCodigo, setErrorLocalCodigo] = useState(null);

    const handleActualizarNombre = async () => {
        if (!nombre || nombre.trim() === '') return;
        setErrorLocalNombre(null); // Limpiamos errores previos al intentar de nuevo

        const response = await actualizarNombre('usuarios/actualizar-nombre', {
            method: 'PUT',
            body: JSON.stringify({ nombre: nombre })
        });

        if (response.exito) {
            setDatosUsuario(prevDatos => ({
                ...prevDatos,
                nombre: response.data.data.nombre
            }));

            setNotificacion({
                mostrar: true,
                mensaje: "¡Perfil Actualizado!",
                descripcion: "Tu nombre de usuario ha sido guardado correctamente."
            });
        } else {
            // Guardamos el mensaje de error del backend para mostrarlo
            setErrorLocalNombre(response.message || "No se pudo actualizar el nombre.");
        }
    }

    const handleActualizarCorreo = async () => {
        if (!correo || correo.trim() === '') return;
        setErrorLocalCorreo(null); // Limpiamos errores previos

        const response = await actualizarCorreo('usuarios/actualizar-correo', {
            method: 'PUT',
            body: JSON.stringify({ email: correo })
        });

        if (response.exito) {
            setDatosUsuario(prevDatos => ({
                ...prevDatos,
                email: response.data.data.email,
                verificado: response.data.data.verificado 
            }));

            setCorreoVerificado(response.data.data.verificado);
            setCodigo("");

            setNotificacion({
                mostrar: true,
                mensaje: "¡Correo Actualizado!",
                descripcion: "Hemos enviado un nuevo código de verificación a tu correo."
            });
        } else {
            setErrorLocalCorreo(response.message || "No se pudo actualizar el correo.");
        }
    }

    const handleVerificarCodigo = async () => {
        if (!codigo || codigo.trim() === '') return;
        setErrorLocalCodigo(null); // Limpiamos errores previos

        const response = await peticionVerificarCodigo('usuarios/verificar', {
            method: 'POST',
            body: JSON.stringify({ codigo: codigo })
        });

        if (response.exito) {
            setCorreoVerificado(true);
            setDatosUsuario(prevDatos => ({
                ...prevDatos,
                verificado: true
            }));

            setNotificacion({
                mostrar: true,
                mensaje: "¡Correo Verificado!",
                descripcion: "Tu cuenta ha sido verificada con éxito."
            });
        } else {
            // Reemplazamos el 'alert' por un mensaje visual en la interfaz
            setErrorLocalCodigo(response.message || "El código es incorrecto o ha expirado.");
        }
    }

    return (
        <section className="mb-5 slide-down-animation">
            <h3 className="fs-4 fw-bold mb-3">Información General</h3>
            <div className="bg-light p-4 rounded-3">
                
                <div className="d-flex align-items-center mb-4">
                    <div className="rounded-circle bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center fw-bold text-dark fs-4 me-3" style={{ width: "60px", height: "60px" }}>
                        {datosUsuario.nombre.charAt(0).toUpperCase()}{datosUsuario.nombre.split(' ')[1]?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h5 className="m-0 fw-bold fs-6">{datosUsuario.nombre}</h5>
                        <span className="badge bg-primary mt-1">{datosUsuario.rol}</span>
                    </div>
                </div>

                <form>
                    {/* CAMPO: NOMBRE */}
                    <div className="mb-4">
                        <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Nombre de Usuario</label>
                        <input
                            type="text"
                            // Agregamos la clase 'is-invalid' de Bootstrap si hay algún error
                            className={`form-control border-0 py-2 shadow-sm ${(errorNombre || errorLocalNombre) ? 'is-invalid' : ''}`}
                            defaultValue={datosUsuario.nombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            placeholder="Tu nombre"
                        />
                        {/* Mostramos el error en rojo debajo del input */}
                        {(errorNombre || errorLocalNombre) && (
                            <div className="text-danger mt-2 fw-medium" style={{ fontSize: "13px" }}>
                                <i className="bi bi-exclamation-triangle-fill me-1"></i> 
                                {errorNombre || errorLocalNombre}
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-end mb-4">
                        <button
                            type="button"
                            className="btn btn-primary px-4 py-2 fw-semibold"
                            onClick={handleActualizarNombre}
                            disabled={guardandoNombre || nombre === datosUsuario.nombre}
                        >
                            {guardandoNombre ? "Guardando..." : "Guardar Nombre"}
                        </button>
                    </div>

                    <hr className="my-4 text-secondary opacity-25" />

                    {/* CAMPO: CORREO */}
                    <div className="mb-4">
                        <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Correo Electrónico</label>
                        <input
                            type="email"
                            className={`form-control border-0 py-2 shadow-sm ${(errorCorreo || errorLocalCorreo) ? 'is-invalid' : ''}`}
                            defaultValue={datosUsuario.email}
                            onChange={(e) => setNuevoCorreo(e.target.value)}
                            placeholder="Tu correo electrónico"
                        />
                        {(errorCorreo || errorLocalCorreo) && (
                            <div className="text-danger mt-2 fw-medium" style={{ fontSize: "13px" }}>
                                <i className="bi bi-exclamation-triangle-fill me-1"></i> 
                                {errorCorreo || errorLocalCorreo}
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-end mb-4">
                        <button
                            type="button"
                            className="btn btn-primary px-4 py-2 fw-semibold"
                            onClick={handleActualizarCorreo}
                            disabled={guardandoCorreo || correo === datosUsuario.email}
                        >
                            {guardandoCorreo ? "Guardando..." : "Guardar Correo"}
                        </button>
                    </div>

                    {/* SECCIÓN CONDICIONAL: CÓDIGO DE VERIFICACIÓN */}
                    {correoVerificado ? (
                        <div className="alert alert-success d-flex align-items-center mb-0 py-2 border-0 shadow-sm" role="alert">
                            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                            <div className="fw-medium text-dark">
                                Tu correo electrónico ha sido verificado.
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-3 rounded-3 shadow-sm border border-warning border-opacity-50">
                            <div className="d-flex align-items-center mb-3 text-warning">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <span className="fw-medium text-dark" style={{ fontSize: "14px" }}>Verifica tu correo para asegurar tu cuenta</span>
                            </div>

                            <InputGenerico
                                label="Código de Verificación"
                                type="text"
                                placeholder="Ingresa tu código"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                disabled={guardandoCodigo}
                            />

                            {/* Mostrar error de validación de código */}
                            {(errorCodigo || errorLocalCodigo) && (
                                <div className="text-danger mt-2 fw-medium" style={{ fontSize: "13px" }}>
                                    <i className="bi bi-exclamation-triangle-fill me-1"></i> 
                                    {errorCodigo || errorLocalCodigo}
                                </div>
                            )}

                            <div className="d-flex justify-content-end mt-3">
                                <button
                                    type="button"
                                    className="btn btn-warning px-4 py-2 fw-semibold text-dark"
                                    onClick={handleVerificarCodigo}
                                    disabled={guardandoCodigo || codigo.trim() === ''}
                                >
                                    {guardandoCodigo ? "Verificando..." : "Verificar Código"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
};

export default InformacionGeneral;