
// Barra superior del panel de administracion (buscador, campana, settings y perfil del admin

import { useState } from "react";

const HeaderAdmin = () => {

    // Estado para el texto del buscador
    const [busqueda, setBusqueda] = useState("");

    return (
        <header className="header-admin d-flex align-items-center justify-content-between">

            {/* Buscador */}
            <div className="header-buscador d-flex align-items-center">
                <i className="bi bi-search header-buscar-icono" />
                <input
                    type="text"
                    className="header-input"
                    placeholder="Buscar Inventario"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            {/* Lado derecho: íconos + perfil */}
            <div className="d-flex align-items-center gap-3">

                
                {/* Separador */}
                <div className="header-separador" />

                {/* Perfil de Admin*/}
                <div className="d-flex align-items-center gap-2">
                    <div className="header-perfil-info">
                        <p className="header-perfil-nombre">Admin User</p>
                        <p className="header-perfil-rol">Administrador</p>
                    </div>
                    
                    <div className="header-avatar">
                        <i className="bi bi-person-fill" />
                    </div>
                </div>

            </div>
        </header>
    );
};

export default HeaderAdmin;