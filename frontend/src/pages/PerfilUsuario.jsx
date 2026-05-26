import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from '../hooks/useApi';
import InputPassword from "../components/InputPassword";
import HistorialFacturas from "../components/HistorialFacturas";
import { SuccessCard } from "../components/SuccessCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


const PerfilUsuario = () => {

    const [datosUsuario, setDatosUsuario] = useState(null);
    const [nombre, setNuevoNombre] = useState("");

    // ESTADO: Controla qué pestaña está visible
    const [seccionActiva, setSeccionActiva] = useState('informacion');

    // NUEVO ESTADO: Controla la tarjeta de éxito
    const [notificacion, setNotificacion] = useState({
        mostrar: false,
        mensaje: "",
        descripcion: ""
    });

    const { logout } = useAuth();


    const navigate = useNavigate(); // Hook de React Router para cambiar de página

    // Función para manejar el clic en "Cerrar Sesión"


    // HOOKS DE FORMULARIO
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const contraseñaNueva = watch("newPassword");

    // HOOKS DE API
    const { ejecutarPeticion: fetchPerfil, isLoading: loadingPerfil, error: errorPerfil } = useApi();
    const { ejecutarPeticion: actualizarNombre, isLoading: guardandoNombre } = useApi();
    const { ejecutarPeticion: actualizarPassword, isLoading: guardandoPassword } = useApi();

    // EFECTOS
    useEffect(() => {
        if (datosUsuario) {
            setNuevoNombre(datosUsuario.nombre);
        }
    }, [datosUsuario]);

    useEffect(() => {
        const fetchDatos = async () => {
            const token = localStorage.getItem('token');
            const responsePerfil = await fetchPerfil('usuarios/mi-perfil', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (responsePerfil.exito) {
                setDatosUsuario(responsePerfil.data.data);
            }
        };

        fetchDatos();
    }, []);

    // HANDLERS
    const handleActualizarNombre = async () => {
        if (!nombre || nombre.trim() === '') return;

        const token = localStorage.getItem('token');
        const response = await actualizarNombre('usuarios/actualizar-nombre', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre: nombre })
        });

        if (response.exito) {
            setDatosUsuario(prevDatos => ({
                ...prevDatos,
                nombre: response.data.data.nombre
            }));

            // Reemplazamos el alert por nuestro componente
            setNotificacion({
                mostrar: true,
                mensaje: "¡Perfil Actualizado!",
                descripcion: "Tu nombre de usuario ha sido guardado correctamente."
            });
        }
    }

    const onSubmitNuevaClave = async (data) => {
        const token = localStorage.getItem('token');
        const response = await actualizarPassword('usuarios/actualizar', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: data.newPassword })
        });

        if (response.exito) {
            reset();

            // Reemplazamos el alert por nuestro componente
            setNotificacion({
                mostrar: true,
                mensaje: "¡Seguridad al día!",
                descripcion: "Tu contraseña ha sido actualizada con éxito."
            });
        }
    }


    const manejarCerrarSesion = () => {
        logout(); // Esto borra el token del contexto y del localStorage
        navigate("/"); // Redirige al usuario al inicio
    };

    // CONTROLES DE CARGA Y ERROR
    if (loadingPerfil || !datosUsuario) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{ minHeight: "80vh" }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <h5 className="text-secondary fw-semibold">Cargando tu perfil...</h5>
            </div>
        );
    }

    if (errorPerfil) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center w-100 px-3 text-center" style={{ minHeight: "80vh" }}>
                <i className="bi bi-exclamation-octagon text-danger mb-3" style={{ fontSize: "3.5rem" }}></i>
                <h4 className="text-dark fw-bold mb-2">No pudimos cargar tu perfil</h4>
                <p className="text-muted mb-4" style={{ maxWidth: "400px" }}>
                    {errorPerfil || "Hubo un problema de conexión con el servidor. Por favor, vuelve a intentarlo."}
                </p>
                <div className="d-flex gap-3">
                    <button className="btn btn-primary px-4 py-2 fw-semibold shadow-sm" onClick={() => window.location.reload()}>
                        <i className="bi bi-arrow-clockwise me-2"></i> Reintentar
                    </button>
                    <a href="/" className="btn btn-outline-secondary px-4 py-2 fw-semibold">
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* OVERLAY DE NOTIFICACIÓN (Se renderiza por encima de todo) */}
            {notificacion.mostrar && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <SuccessCard
                        mensaje={notificacion.mensaje}
                        descripcion={notificacion.descripcion}
                        setSubmitted={(valor) => setNotificacion({ ...notificacion, mostrar: valor })}
                        text="Aceptar"
                        linkTo="#" // El '#' evita que React Router cambie de página bruscamente
                        sinFondo={true}
                    />
                </div>
            )}

            <div className="container py-5">
                <div className="row">

                    {/* ========================================== */}
                    {/* BARRA LATERAL (SIDEBAR) */}
                    {/* ========================================== */}
                    <aside className="col-12 col-md-3 col-lg-3 mb-4">
                        <h4 className="fs-5 fw-bold mb-4 px-3">Mi Perfil</h4>
                        <div className="d-flex flex-column gap-2">
                            <button className={`btn d-flex align-items-center justify-content-start border-0 fw-semibold px-3 py-2 text-start ${seccionActiva === 'informacion' ? 'btn-light text-primary' : 'btn-white text-secondary'}`} onClick={() => setSeccionActiva('informacion')}>
                                <i className="bi bi-person-circle me-3"></i> Información General
                            </button>
                            <button className={`btn d-flex align-items-center justify-content-start border-0 fw-semibold px-3 py-2 text-start ${seccionActiva === 'seguridad' ? 'btn-light text-primary' : 'btn-white text-secondary'}`} onClick={() => setSeccionActiva('seguridad')}>
                                <i className="bi bi-lock me-3"></i> Seguridad
                            </button>
                            <button className={`btn d-flex align-items-center justify-content-start border-0 fw-semibold px-3 py-2 text-start ${seccionActiva === 'facturacion' ? 'btn-light text-primary' : 'btn-white text-secondary'}`} onClick={() => setSeccionActiva('facturacion')}>
                                <i className="bi bi-receipt me-3"></i> Facturación
                            </button>
                            <button className={`btn d-flex align-items-center justify-content-start border-0 fw-semibold px-3 py-2 text-start ${seccionActiva === 'deseos' ? 'btn-light text-primary' : 'btn-white text-secondary'}`} onClick={() => setSeccionActiva('deseos')}>
                                <i className="bi bi-heart me-3"></i> Lista de Deseos
                            </button>
                            <hr className="my-2" />
                            <button className="btn btn-white text-danger d-flex align-items-center justify-content-start border-0 px-3 py-2 text-start mt-4" onClick={manejarCerrarSesion}>
                                <i className="bi bi-box-arrow-right me-3"></i> Cerrar Sesión
                            </button>
                        </div>
                    </aside>

                    {/* ========================================== */}
                    {/* CONTENIDO PRINCIPAL */}
                    {/* ========================================== */}
                    <main className="col-12 col-md-9 col-lg-8 offset-lg-1">

                        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
                        {seccionActiva === 'informacion' && (
                            <section className="mb-5 slide-down-animation">
                                <h3 className="fs-4 fw-bold mb-3">Información General</h3>
                                <div className="bg-light p-4 rounded-3">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="rounded-circle bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center fw-bold text-dark fs-4 me-3" style={{ width: "60px", height: "60px" }}>
                                            {datosUsuario.nombre.charAt(0).toUpperCase()}{datosUsuario.nombre.split(' ')[1]?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h5 className="m-0 fw-bold fs-6">{datosUsuario.nombre}</h5>
                                            <span className="badge bg-primary mt-1">Usuario</span>
                                        </div>
                                    </div>
                                    <form>
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
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="button"
                                                className="btn btn-primary px-4 py-2 fw-semibold"
                                                onClick={handleActualizarNombre}
                                                disabled={guardandoNombre || nombre === datosUsuario.nombre}
                                            >
                                                {guardandoNombre ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...</>
                                                ) : ("Guardar Nombre")}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN 2: SEGURIDAD */}
                        {seccionActiva === 'seguridad' && (
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
                        )}

                        {/* SECCIÓN 3: FACTURACIÓN */}
                        {seccionActiva === 'facturacion' && (
                            <section className="mb-5 slide-down-animation">
                                <h3 className="fs-4 fw-bold mb-3">Facturación</h3>
                                <HistorialFacturas endpointFetch="facturas/obtener-facturas-usuario" />
                            </section>
                        )}

                        {/* SECCIÓN 4: LISTA DE DESEOS */}
                        {seccionActiva === 'deseos' && (
                            <section className="mb-5 slide-down-animation">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className="fs-4 fw-bold m-0">Lista de Deseos</h3>
                                    <span className="badge bg-danger rounded-pill">2 items</span>
                                </div>
                                <div className="row row-cols-1 row-cols-md-2 g-4">
                                    <div className="col">
                                        <div className="card border-0 bg-light h-100 p-4 text-center d-flex flex-column justify-content-center align-items-center text-secondary border border-secondary border-opacity-25 border-dashed" style={{ borderStyle: 'dashed' }}>
                                            <i className="bi bi-phone mb-2 fs-1 text-secondary opacity-50"></i>
                                            <p className="m-0" style={{ fontSize: "13px" }}>Tu <b>ProductCard</b> irá aquí</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="card border-0 bg-light h-100 p-4 text-center d-flex flex-column justify-content-center align-items-center text-secondary border border-secondary border-opacity-25 border-dashed" style={{ borderStyle: 'dashed' }}>
                                            <i className="bi bi-smartwatch mb-2 fs-1 text-secondary opacity-50"></i>
                                            <p className="m-0" style={{ fontSize: "13px" }}>Tu <b>ProductCard</b> irá aquí</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                    </main>
                </div>
            </div>
        </>
    );
};

export default PerfilUsuario;