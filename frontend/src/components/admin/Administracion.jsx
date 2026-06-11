import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { ListaAdministradores } from "./ListaAdministradores";
import { TarjetaEstadistica } from "./TarjetaEstadistica";
import ModalEditarAdmin from "./forms/ModalEditarAdmin";
import ModalRegistrarAdmin from "./forms/ModalRegistrarAdmin";
import Toast from "../common/Toast";

export const Administracion = () => {

    const [modalEditarAdmin, setModalEditarAdmin] = useState(false);
    const [adminAEditar, setAdminAEditar] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);

    // Toast — un solo estado para manejar ambos casos
    const [toast, setToast] = useState({ visible: false, mensaje: "" });

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
        cargarAdmins();
    }, []);

    const mostrarToast = (mensaje) => {
        setToast({ visible: true, mensaje });
    };

    const cargarAdmins = async () => {
        const respuesta = await ejecutarPeticion("staff", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
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
            setAdmins(prev => prev.map(a =>
                a.id === id ? { ...a, activo: 0 } : a
            ));
            setStats(prev => ({
                ...prev,
                activos: prev.activos - 1,
                deshabilitados: prev.deshabilitados + 1
            }));
        } else {
            alert("No se pudo deshabilitar el administrador.");
        }
    };

    const restaurarAdmin = async (id) => {
        const result = await ejecutarPeticion(`staff/restaurar/${id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (result.exito) {
            setAdmins(prev => prev.map(a =>
                a.id === id ? { ...a, activo: 1 } : a
            ));
            setStats(prev => ({
                ...prev,
                activos: prev.activos + 1,
                deshabilitados: prev.deshabilitados - 1
            }));
        } else {
            alert("No se pudo restaurar el administrador.");
        }
    };

    const resetearPassword = async (id) => {
        const result = await ejecutarPeticion(`staff/reset-password/${id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (result.exito) {
            mostrarToast("Contraseña reseteada con éxito");
        } else {
            alert("No se pudo resetear la contraseña.");
        }
    };

    return (
        <>
            {/* ENCABEZADO */}
            <div className="d-flex align-items-start justify-content-between mb-5 text-start">
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
                    className="admin-btn-nuevo px-4 py-2"
                    onClick={() => setModalAbierto(true)}
                >
                    <i className="bi bi-person-plus-fill me-2" />
                    Añadir Administrador
                </button>
            </div>

            <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>

                {/* TARJETAS DE ESTADÍSTICAS */}
                <div className="row g-4 mb-5">
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

                {/* ESTADO DE CARGA */}
                {isLoading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="alert alert-danger">
                        Error al cargar los administradores: {error}
                    </div>
                )}

                {/* TABLA */}
                {!isLoading && !error && (
                    <ListaAdministradores
                        administradores={admins}
                        onDeshabilitar={deshabilitarAdmin}
                        onRestaurar={restaurarAdmin}
                        onResetPassword={resetearPassword}
                        onEditar={(id) => {
                            setAdminAEditar(admins.find(a => a.id === id));
                            setModalEditarAdmin(true);
                        }}
                    />
                )}

            </div>

            {/* MODAL REGISTRAR */}
            <ModalRegistrarAdmin
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                onAdminAgregado={() => {
                    cargarAdmins();
                    mostrarToast("Administrador registrado con éxito");
                }}
            />

            {/* MODAL EDITAR */}
            <ModalEditarAdmin
                isOpen={modalEditarAdmin}
                admin={adminAEditar}
                onClose={() => {
                    setModalEditarAdmin(false);
                    setAdminAEditar(null);
                }}
                onAdminActualizado={actualizarAdminEnLista}
            />

            {/* TOAST — aparece abajo al centro para ambas acciones */}
            <Toast
                visible={toast.visible}
                mensaje={toast.mensaje}
                onClose={() => setToast({ visible: false, mensaje: "" })}
            />
        </>
    );
};