import React, { useState } from "react"
import { ListaAdministradores } from "./ListaAdministradores";
import { TarjetaEstadistica } from "./TarjetaEstadistica";
export const Administracion = () => {
    // MOCK DATA: Datos de prueba basados en tu imagen
    const stats = { total: 24, activos: 22, deshabilitados: 2, roles: 2 };

    const mockAdmins = [
        { id: 1, nombre: "Adrian Sánchez", email: "adrian.s@airmobile.com", rol: "admin", activo: 1 },
        { id: 2, nombre: "Lucía Mendoza", email: "l.mendoza@airmobile.com", rol: "admin", activo: 1 },
        { id: 3, nombre: "Roberto Blanco", email: "r.blanco@airmobile.com", rol: "admin", activo: 0 },
        { id: 4, nombre: "Elena Gómez", email: "elena.g@airmobile.com", rol: "admin", activo: 1 }
    ];

    const [modalAbierto, setModalAbierto] = useState(false);

    return (
        <>

            {/* ENCABEZADO */}
            <div className="d-flex align-items-start justify-content-between mb-5 text-start">
                <div style={{ maxWidth: '650px' }}>
                    <h1 className="fw-bold mb-2" style={{ color: '#111827', fontSize: '2.5rem' }}>Administradores</h1>
                    <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                        Gestiona el equipo de acceso al panel de control de Air Mobile. Define roles,
                        permisos y mantén la integridad de la plataforma.
                    </p>
                </div>

                {/* BOTÓN PRINCIPAL (Usando tu clase de inventario) */}
                <button
                    className="admin-btn-nuevo px-4 py-2"
                    onClick={() => setModalAbierto(!modalAbierto)}
                >
                    <i className="bi bi-person-plus-fill me-2" />
                    Añadir Administrador
                </button>
            </div>
            <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fc', minHeight: '100vh' }}>
                {/* TARJETAS DE ESTADÍSTICAS (KPIs) */}
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

                {/* TABLA */}
                <ListaAdministradores administradores={mockAdmins} />
            </div>
        </>

    );
};