import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { ListaAdministradores } from "./ListaAdministradores";
import { TarjetaEstadistica } from "./TarjetaEstadistica";
import ModalEditarAdmin from "./forms/ModalEditarAdmin";
import ModalRegistrarAdmin from "./forms/ModalRegistrarAdmin";
import ModalConfirmarEliminar from "./forms/ModalConfirmarEliminar";
import Toast from "../common/Toast";
import ModalConfirmarAccion from "./forms/ModalConfirmarAccion";

export const Administracion = () => {

    const [modalEditarAdmin, setModalEditarAdmin] = useState(false);
    const [adminAEditar, setAdminAEditar] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [toast, setToast] = useState({ visible: false, mensaje: "" });
    const [adminAEliminar, setAdminAEliminar] = useState(null);
    // --- NUEVOS ESTADOS PARA FILTROS ---
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState(""); // "" = todos, "1" = activos, "0" = inactivos
    const [adminAResetear, setAdminAResetear] = useState(null);
    const { token } = useAuth();
    const { ejecutarPeticion, isLoading, error } = useApi();

    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        deshabilitados: 0,
        roles: 0
    });


    useEffect(() => {
        const timer = setTimeout(() => {
            cargarAdmins();
        }, 300);


        return () => clearTimeout(timer);

    }, [busqueda, estadoFiltro]);

    const mostrarToast = (mensaje) => {
        setToast({ visible: true, mensaje });
    };

    const cargarAdmins = async () => {

        const params = new URLSearchParams();

        if (busqueda.trim() !== "") {
            params.append("buscar", busqueda.trim());
        }

        if (estadoFiltro !== "") {
            params.append("activo", estadoFiltro);
        }

        const url = `staff${params.toString() ? `?${params.toString()}` : ""}`;

        const respuesta = await ejecutarPeticion(url, {
            method: "GET",
        });

        if (respuesta.exito) {
            const lista = respuesta.data?.data || [];

            if (!Array.isArray(lista)) return;

            setAdmins(lista);


            const activos = lista.filter(a => a.activo === 1).length;
            const deshabilitados = lista.filter(a => a.activo === 0).length;
            const roles = [...new Set(lista.map(a => a.rol))].length;

            setStats({ total: lista.length, activos, deshabilitados, roles });
        }
    };

    const actualizarAdminEnLista = (id, datosActualizados) => {
        setAdmins(prev => prev.map(a =>
            a.id === id ? { ...a, ...datosActualizados } : a
        ));
    };

    const deshabilitarAdmin = async (id) => {
        const result = await ejecutarPeticion(`staff/baja/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (result.exito) {
            setAdmins(prev => prev.map(a => a.id === id ? { ...a, activo: 0 } : a));
            setStats(prev => ({ ...prev, activos: prev.activos - 1, deshabilitados: prev.deshabilitados + 1 }));
        } else alert("No se pudo deshabilitar el administrador.");
    };

    const restaurarAdmin = async (id) => {
        const result = await ejecutarPeticion(`staff/restaurar/${id}`, {
            method: "PUT",
        });

        if (result.exito) {
            setAdmins(prev => prev.map(a => a.id === id ? { ...a, activo: 1 } : a));
            setStats(prev => ({ ...prev, activos: prev.activos + 1, deshabilitados: prev.deshabilitados - 1 }));
        } else alert("No se pudo restaurar el administrador.");
    };

    const abrirModalReset = (id) => {
        const admin = admins.find(a => a.id === id);
        setAdminAResetear(admin);
    };

    const confirmarResetPassword = async () => {
        if (!adminAResetear) return;

        const result = await ejecutarPeticion(`staff/reset-password/${adminAResetear.id}`, {
            method: "PUT",
        });

        if (result.exito) {
            mostrarToast(result.data?.message || "Contraseña reseteada y enviada por correo con éxito.");
        } else {
            alert(result.error || "No se pudo resetear la contraseña.");
        }

        // Cerramos el modal
        setAdminAResetear(null);
    };
    const abrirModalDeshabilitar = (id) => {
        const admin = admins.find(a => a.id === id);
        setAdminAEliminar(admin);
    };

    const confirmarDeshabilitarAdmin = async () => {
        if (!adminAEliminar) return;

        const result = await ejecutarPeticion(`staff/baja/${adminAEliminar.id}`, {
            method: "DELETE",
        });

        if (result.exito) {
            setAdmins(prev => prev.map(a => a.id === adminAEliminar.id ? { ...a, activo: 0 } : a));
            setStats(prev => ({ ...prev, activos: prev.activos - 1, deshabilitados: prev.deshabilitados + 1 }));
            mostrarToast("Administrador dado de baja exitosamente");
        } else {
            alert("No se pudo deshabilitar el administrador.");
        }

        // Cerramos el modal
        setAdminAEliminar(null);
    };
    return (
        <>
            {/* ENCABEZADO */}
            <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between mb-5 text-start gap-3">
                <div style={{ maxWidth: '650px' }}>
                    <h1 className="fw-bold mb-2" style={{ color: '#111827', fontSize: '2.5rem' }}>
                        Administradores
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                        Gestiona el equipo de acceso al panel de control de Air Mobile. Define roles,
                        permisos y mantén la integridad de la plataforma.
                    </p>
                </div>

                <button
                    className="admin-btn-nuevo px-4 py-2 text-nowrap"
                    onClick={() => setModalAbierto(true)}
                >
                    <i className="bi bi-person-plus-fill me-2" />
                    Añadir Administrador
                </button>
            </div>

            <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh', borderRadius: "1rem" }}>

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <TarjetaEstadistica titulo="Total Usuarios" valor={stats.total} color="#0d6efd" />
                    </div>
                    <div className="col-md-3">
                        <TarjetaEstadistica titulo="Activos" valor={stats.activos} color="#198754" />
                    </div>
                    <div className="col-md-3">
                        <TarjetaEstadistica titulo="Deshabilitados" valor={stats.deshabilitados} color="#adb5bd" />
                    </div>
                    <div className="col-md-3">
                        <TarjetaEstadistica titulo="Roles definidos" valor={stats.roles} color="#212529" />
                    </div>
                </div>

                {/* --- BARRA DE FILTROS --- */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm border-0">

                    {/* Buscador de texto */}
                    <div className="input-group" style={{ maxWidth: '400px' }}>
                        <span className="input-group-text bg-light border-end-0 text-muted">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control bg-light border-start-0 ps-0"
                            placeholder="Buscar por nombre o email..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Botones de estado (Píldoras) */}
                    <div className="d-flex gap-2 overflow-x-auto pb-1 pb-md-0" style={{ whiteSpace: 'nowrap' }}>
                        <button
                            className={`btn rounded-pill px-4 py-1 fw-semibold ${estadoFiltro === "" ? "btn-dark text-white" : "btn-light text-muted border"}`}
                            onClick={() => setEstadoFiltro("")}
                        >
                            Todos
                        </button>
                        <button
                            className={`btn rounded-pill px-4 py-1 fw-semibold ${estadoFiltro === "1" ? "btn-success text-white" : "btn-light text-muted border"}`}
                            onClick={() => setEstadoFiltro("1")}
                        >
                            Activos
                        </button>
                        <button
                            className={`btn rounded-pill px-4 py-1 fw-semibold ${estadoFiltro === "0" ? "btn-secondary text-white" : "btn-light text-muted border"}`}
                            onClick={() => setEstadoFiltro("0")}
                        >
                            Inactivos
                        </button>
                    </div>
                </div>

                {/* ESTADO DE CARGA */}
                {isLoading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                        <p className="text-muted mt-3">Buscando administradores...</p>
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="alert alert-danger rounded-4 shadow-sm">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Error al cargar los administradores: {error}
                    </div>
                )}

                {/* TABLA O MENSAJE DE VACÍO */}
                {!isLoading && !error && admins.length === 0 && (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm border-0">
                        <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
                        <h5 className="text-muted mt-3">No se encontraron resultados</h5>
                        <p className="text-muted small">Intenta ajustar los filtros de búsqueda.</p>
                    </div>
                )}

                {!isLoading && !error && admins.length > 0 && (
                    <ListaAdministradores
                        administradores={admins}
                        onDeshabilitar={abrirModalDeshabilitar}
                        onRestaurar={restaurarAdmin}
                        onResetPassword={abrirModalReset}
                        onEditar={(id) => {
                            setAdminAEditar(admins.find(a => a.id === id));
                            setModalEditarAdmin(true);
                        }}
                    />
                )}

            </div>

            {/* MODALES Y TOAST  */}

            <ModalConfirmarEliminar
                isOpen={!!adminAEliminar}
                onCancelar={() => setAdminAEliminar(null)}
                onConfirmar={confirmarDeshabilitarAdmin}
                titulo="¿Dar de baja al Administrador?"
                nombreItem={adminAEliminar?.nombre}
                mensajeExtra="El usuario perderá acceso inmediato al panel de control de AirMobile."
            />

            <ModalRegistrarAdmin
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onAdminAgregado={() => {
                    cargarAdmins();
                    mostrarToast("Administrador registrado con éxito");
                }}
            />

            <ModalEditarAdmin
                isOpen={modalEditarAdmin}
                admin={adminAEditar}
                onClose={() => {
                    setModalEditarAdmin(false);
                    setAdminAEditar(null);
                }}
                onAdminActualizado={actualizarAdminEnLista}
            />

            <ModalConfirmarAccion
                isOpen={!!adminAResetear}
                onCancelar={() => setAdminAResetear(null)}
                onConfirmar={confirmarResetPassword}
                titulo="¿Blanquear contraseña?"
                mensajePrincipal="Se generará una nueva contraseña temporal para"
                nombreItem={adminAResetear?.nombre}
                mensajeExtra="El usuario recibirá las nuevas credenciales en su correo y las anteriores dejarán de funcionar inmediatamente."
                textoBoton="Resetear Contraseña"
                colorBoton="btn-warning text-dark"
                iconoBoton="bi-key-fill"
            />

            <Toast
                visible={toast.visible}
                mensaje={toast.mensaje}
                onClose={() => setToast({ visible: false, mensaje: "" })}
            />
        </>
    );
};