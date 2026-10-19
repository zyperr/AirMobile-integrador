import { useEffect, useState } from "react";
import { useApi } from '../hooks/useApi';
import { SuccessCard } from "../components/common/SuccessCard";
import { Outlet } from "react-router-dom";
import SidebarPerfil from "../components/cuenta/SidebarPerfil";

const PerfilUsuario = () => {
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: "", descripcion: "" });

    const { ejecutarPeticion: fetchPerfil, isLoading: loadingPerfil, error: errorPerfil } = useApi();

    useEffect(() => {
        const fetchDatos = async () => {
            const responsePerfil = await fetchPerfil('usuarios/mi-perfil', { method: 'GET' });
            if (responsePerfil.exito) {
                setDatosUsuario(responsePerfil.data.data);
            }
        };
        fetchDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loadingPerfil || !datosUsuario) {
        return (
            <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: "80vh" }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    if (errorPerfil) {
        return (
            <div className="text-center mt-5">
                <h4 className="text-danger">Error al cargar perfil</h4>
                <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>Reintentar</button>
            </div>
        );
    }

    return (
        <>
            {notificacion.mostrar && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <SuccessCard
                        mensaje={notificacion.mensaje}
                        descripcion={notificacion.descripcion}
                        setSubmitted={(v) => setNotificacion({ ...notificacion, mostrar: v })}
                        text="Aceptar"
                        linkTo="#"
                        sinFondo={true}
                    />
                </div>
            )}

            <div className="container py-5 ">
                <div className="row">
                    <SidebarPerfil datosUsuario={datosUsuario} />

                    <main className="col-12 col-md-9 col-lg-8 offset-lg-1">
                        {/* Acá se inyectan las vistas. Le pasamos las funciones y datos compartidos usando 'context' */}
                        <Outlet context={{ datosUsuario, setDatosUsuario, setNotificacion }} />
                    </main>
                </div>
            </div>
        </>
    );
};

export default PerfilUsuario;