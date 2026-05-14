

const PerfilUsuario = ({id}) => {
    return (
        <div className="container py-5">
            <div className="row">

                {/* ========================================== */}
                {/* BARRA LATERAL (SIDEBAR) */}
                {/* ========================================== */}
                <aside className="col-12 col-md-3 col-lg-3 mb-4">
                    <h4 className="fs-5 fw-bold mb-4 px-3">Mi Perfil</h4>

                    <div className="d-flex flex-column gap-2">
                        {/* Botón activo */}
                        <button className="btn btn-light text-primary d-flex align-items-center justify-content-start border-0 fw-semibold px-3 py-2 text-start">
                            <i className="bi bi-person-circle me-3"></i> Información General
                        </button>

                        <button className="btn btn-white text-secondary d-flex align-items-center justify-content-start border-0 px-3 py-2 text-start">
                            <i className="bi bi-lock me-3"></i> Seguridad
                        </button>

                        <button className="btn btn-white text-secondary d-flex align-items-center justify-content-start border-0 px-3 py-2 text-start">
                            <i className="bi bi-receipt me-3"></i> Facturación
                        </button>

                        <button className="btn btn-white text-secondary d-flex align-items-center justify-content-start border-0 px-3 py-2 text-start">
                            <i className="bi bi-heart me-3"></i> Lista de Deseos
                        </button>

                        <hr className="my-2" />

                        <button className="btn btn-white text-danger d-flex align-items-center justify-content-start border-0 px-3 py-2 text-start mt-4">
                            <i className="bi bi-box-arrow-right me-3"></i> Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* ========================================== */}
                {/* CONTENIDO PRINCIPAL */}
                {/* ========================================== */}
                <main className="col-12 col-md-9 col-lg-8 offset-lg-1">

                    {/* SECCIÓN 1: INFORMACIÓN GENERAL (Solo Nombre) */}
                    <section className="mb-5">
                        <h3 className="fs-4 fw-bold mb-3">Información General</h3>

                        <div className="bg-light p-4 rounded-3">
                            <div className="d-flex align-items-center mb-4">
                                <div className="rounded-circle bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center fw-bold text-dark fs-4 me-3" style={{ width: "60px", height: "60px" }}>
                                    M
                                </div>
                                <div>
                                    <h5 className="m-0 fw-bold fs-6">Mauri</h5>
                                    <span className="badge bg-primary mt-1">Usuario</span>
                                </div>
                            </div>

                            <form>
                                <div className="mb-4">
                                    <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Nombre de Usuario</label>
                                    <input
                                        type="text"
                                        className="form-control border-0 py-2 shadow-sm"
                                        defaultValue="Mauri"
                                        placeholder="Tu nombre"
                                    />
                                </div>

                                <div className="d-flex justify-content-end">
                                    <button type="button" className="btn btn-primary px-4 py-2 fw-semibold">
                                        Guardar Nombre
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* SECCIÓN 2: SEGURIDAD (Cambio de contraseña) */}
                    <section className="mb-5">
                        <h3 className="fs-4 fw-bold mb-3">Seguridad</h3>
                        <div className="bg-light p-4 rounded-3">
                            <h5 className="fs-6 fw-bold mb-4">Cambiar Contraseña</h5>
                            <form>
                                <div className="mb-3">
                                    <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px" }}>Contraseña Actual</label>
                                    <input type="password" className="form-control border-0 py-2 shadow-sm" placeholder="********" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px" }}>Nueva Contraseña</label>
                                    <input type="password" className="form-control border-0 py-2 shadow-sm" placeholder="Mínimo 8 caracteres" />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px" }}>Confirmar Nueva Contraseña</label>
                                    <input type="password" className="form-control border-0 py-2 shadow-sm" placeholder="Repite la nueva contraseña" />
                                </div>

                                <div className="d-flex justify-content-end">
                                    <button type="button" className="btn btn-outline-primary px-4 py-2 fw-semibold">
                                        Actualizar Contraseña
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {/* SECCIÓN 3: FACTURACIÓN */}
                    <section className="mb-5">
                        <h3 className="fs-4 fw-bold mb-3">Facturación</h3>
                        <div className="bg-light p-4 rounded-3">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fs-6 fw-bold m-0">Historial de Pagos</h5>
                                <button className="btn btn-link text-primary fw-semibold text-decoration-none p-0" style={{ fontSize: "12px" }}>
                                    Descargar Todas <i className="bi bi-download ms-1"></i>
                                </button>
                            </div>

                            {/* Item de Historial (Ejemplo 1) */}
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center py-3 border-bottom border-secondary border-opacity-10 gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white rounded p-2 text-secondary shadow-sm">
                                        <i className="bi bi-receipt"></i>
                                    </div>
                                    <div>
                                        <p className="m-0 fw-bold text-dark" style={{ fontSize: "14px" }}>INV-2026-089</p>
                                        <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>14 May 2026 • iPhone 13 Pro</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                                    <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>$850.50</span>
                                    <button className="btn btn-light btn-sm text-secondary px-2"><i className="bi bi-download"></i></button>
                                </div>
                            </div>

                            {/* Item de Historial (Ejemplo 2) */}
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center py-3 border-bottom border-secondary border-opacity-10 gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white rounded p-2 text-secondary shadow-sm">
                                        <i className="bi bi-receipt"></i>
                                    </div>
                                    <div>
                                        <p className="m-0 fw-bold text-dark" style={{ fontSize: "14px" }}>INV-2026-089</p>
                                        <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>14 May 2026 • iPhone 13 Pro</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3">
                                    <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>$850.50</span>
                                    <button className="btn btn-light btn-sm text-secondary px-2"><i className="bi bi-download"></i></button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 4: LISTA DE DESEOS */}
                    <section className="mb-5">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="fs-4 fw-bold m-0">Lista de Deseos</h3>
                            <span className="badge bg-danger rounded-pill">2 items</span>
                        </div>

                        {/* Aquí usarás la grilla exacta que hicimos para el catálogo */}
                        <div className="row row-cols-1 row-cols-md-2 g-4">

                            {/* Placeholder 1: Cuando tengas backend, aquí harás el .map() e insertarás tu <ProductCard /> */}
                            <div className="col">
                                <div className="card border-0 bg-light h-100 p-4 text-center d-flex flex-column justify-content-center align-items-center text-secondary border border-secondary border-opacity-25 border-dashed" style={{ borderStyle: 'dashed' }}>
                                    <i className="bi bi-phone mb-2 fs-1 text-secondary opacity-50"></i>
                                    <p className="m-0" style={{ fontSize: "13px" }}>Tu <b>ProductCard</b> irá aquí</p>
                                </div>
                            </div>

                            {/* Placeholder 2 */}
                            <div className="col">
                                <div className="card border-0 bg-light h-100 p-4 text-center d-flex flex-column justify-content-center align-items-center text-secondary border border-secondary border-opacity-25 border-dashed" style={{ borderStyle: 'dashed' }}>
                                    <i className="bi bi-smartwatch mb-2 fs-1 text-secondary opacity-50"></i>
                                    <p className="m-0" style={{ fontSize: "13px" }}>Tu <b>ProductCard</b> irá aquí</p>
                                </div>
                            </div>

                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
};

export default PerfilUsuario;