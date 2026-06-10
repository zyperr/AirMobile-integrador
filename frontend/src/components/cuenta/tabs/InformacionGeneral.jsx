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

    // NUEVO ESTADO: Para saber si ya verificó el correo (idealmente esto debería venir en datosUsuario desde tu BD)
    const [correoVerificado, setCorreoVerificado] = useState(datosUsuario.verificado || false);

    const { ejecutarPeticion: actualizarNombre, isLoading: guardandoNombre } = useApi();
    const { ejecutarPeticion: actualizarCorreo, isLoading: guardandoCorreo } = useApi();
    const { ejecutarPeticion: peticionVerificarCodigo, isLoading: guardandoCodigo } = useApi();



    const handleActualizarNombre = async () => {
        if (!nombre || nombre.trim() === '') return;

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
        }
    }

    const handleActualizarCorreo = async () => {
        if (!correo || correo.trim() === '') return;

        const response = await actualizarCorreo('usuarios/actualizar-correo', {
            method: 'PUT',
            body: JSON.stringify({ email: correo })
        });

        if (response.exito) {
            // 1. Actualizamos el estado GLOBAL (así se mantiene si cambia de pestaña)
            setDatosUsuario(prevDatos => ({
                ...prevDatos,
                email: response.data.data.email,
                verificado: response.data.data.verificado // Tomamos el 'false' que manda el backend
            }));

            // 2. Actualizamos el estado LOCAL
            setCorreoVerificado(response.data.data.verificado); // Se vuelve false
            setCodigo("");

            setNotificacion({
                mostrar: true,
                mensaje: "¡Correo Actualizado!",
                descripcion: "Hemos enviado un nuevo código de verificación a tu correo."
            });
        }
    }
    console.log("datos usuario", { datosUsuario });
    // NUEVO HANDLER: Para manejar el envío del código
    const handleVerificarCodigo = async () => {
        if (!codigo || codigo.trim() === '') return;

        // Ajusta la ruta y el método según tu backend
        const response = await peticionVerificarCodigo('usuarios/verificar', {
            method: 'POST',
            body: JSON.stringify({ codigo: codigo })
        });

        if (response.exito) {
            // 1. Ocultamos el input localmente
            setCorreoVerificado(true);

            // 2. Actualizamos el estado GLOBAL (para que no vuelva a pedirlo al recargar el componente)
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
            alert(response.message || "Código incorrecto");
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
                            className="form-control border-0 py-2 shadow-sm"
                            defaultValue={datosUsuario.nombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            placeholder="Tu nombre"
                        />
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
                            className="form-control border-0 py-2 shadow-sm"
                            defaultValue={datosUsuario.email}
                            onChange={(e) => setNuevoCorreo(e.target.value)}
                            placeholder="Tu correo electrónico"
                        />
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
                        /* Si está verificado, mostramos un badge de éxito y ocultamos el input */
                        <div className="alert alert-success d-flex align-items-center mb-0 py-2 border-0 shadow-sm" role="alert">
                            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                            <div className="fw-medium text-dark">
                                Tu correo electrónico ha sido verificado.
                            </div>
                        </div>
                    ) : (
                        /* Si NO está verificado, mostramos el input y el botón */
                        <div className="bg-white p-3 rounded-3 shadow-sm border border-warning border-opacity-50">
                            <div className="d-flex align-items-center mb-3 text-warning">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <span className="fw-medium text-dark" style={{ fontSize: "14px" }}>Verifica tu correo para asegurar tu cuenta</span>
                            </div>

                            {/* OJO: Asumimos que tu InputGenerico acepta un 'onChange' o similar */}
                            <InputGenerico
                                label="Código de Verificación"
                                type="text"
                                placeholder="Ingresa tu código"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                disabled={guardandoCodigo}
                            />

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