import { useState } from "react";

const Registro = () => {
const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
});

const [errors, setErrors] = useState({});
const [submitted, setSubmitted] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Se elimina el error del campo cuando el usuario escribe
    if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
    }
};

const validar = () => {
    let tempErrors = {};

    if (!form.nombre.trim()) {
        tempErrors.nombre = "El nombre completo es requerido.";
    } else if (form.nombre.trim().length < 3) {
        tempErrors.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    if (!form.email.trim()) {
        tempErrors.email = "El correo electrónico es requerido.";
    } else if (!form.email.includes("@") || !form.email.includes(".")) {
        tempErrors.email = "Ingresá un correo electrónico válido.";
    }

    if (!form.password) {
        tempErrors.password = "La contraseña es requerida.";
    } else if (form.password.length < 6) {
        tempErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    } else if (!/[A-Z]/.test(form.password)) {
        tempErrors.password =
        "La contraseña debe contener al menos una mayúscula.";
    } else if (!/[0-9]/.test(form.password)) {
        tempErrors.password = "La contraseña debe contener al menos un número.";
    }

    if (!form.confirmarPassword) {
        tempErrors.confirmarPassword = "Por favor confirmá tu contraseña.";
    } else if (form.password !== form.confirmarPassword) {
        tempErrors.confirmarPassword = "Las contraseñas no coinciden.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
};

const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
        console.log("Enviando datos...", form);
        setSubmitted(true);
    }
};

if (submitted) {
    return (
    <div className="registro-wrapper d-flex align-items-center justify-content-center min-vh-100">
        <div className="registro-card text-center p-5">
            <div className="success-icon mb-4">
            <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
            <circle cx="32" cy="32" r="32" fill="#1a3a6b" />
            <path
                d="M20 32l9 9 15-18"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            </svg>
            </div>
            <h3 className="fw-bold mb-2" style={{ color: "#1a3a6b" }}>
            ¡Cuenta creada!
            </h3>
            <p className="text-muted mb-4">
            Tu cuenta fue creada exitosamente. Ya podés iniciar sesión.
            </p>
            <button
                className="btn-registro w-100"
                onClick={() => {
                setSubmitted(false);
                setForm({
                nombre: "",
                email: "",
                password: "",
                confirmarPassword: "",
            });
            }}>
            Volver al registro
            </button>
        </div>
        <style>{styles}</style>
    </div>
    );
}

return (
    <div className="registro-wrapper d-flex align-items-center justify-content-center min-vh-100 py-4">
        <div className="registro-card p-4 p-md-5">
        {/* --HEADER-- */}
            <div className="text-center mb-4">
                <h1 className="registro-title mb-2">Crea tu cuenta.</h1>
                <p className="registro-subtitle">Únete a nuestra comunidad para disfrutar de acceso exclusivo a los{" "}
                <span className="fw-semibold" style={{ color: "#1a3a6b" }}>
                mejores iPhone de segunda mano certificados.
                </span>
                </p>
            </div>

        {/* --FORMULARIO-- */}
        <div onSubmit={handleSubmit} noValidate style={{textAlign: "left"}}>
          {/* --NOMBRE-- */}
            <div className="mb-3">
                <label className="form-label registro-label">Nombre completo</label>
                <input
                    type="text"
                    name="nombre"
                    className={`form-control registro-input ${
                    errors.nombre ? "is-invalid" : form.nombre ? "is-valid" : ""
                }`}
                placeholder="John Gomez"
                value={form.nombre}
                onChange={handleChange}
                autoComplete="name"
                />
                {errors.nombre && (
                <div className="invalid-feedback">{errors.nombre}</div>
                )}
            </div>

            {/* --EMAIL-- */}
            <div className="mb-3">
                <label className="form-label registro-label">
                    Dirección de correo electrónico
                </label>
                <input
                    type="email"
                    name="email"
                    className={`form-control registro-input ${
                    errors.email ? "is-invalid" : form.email ? "is-valid" : ""
                }`}
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                />
                {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
                )}
            </div>

            {/* -CONTRASEÑA-- */}
            <div className="mb-3">
                <label className="form-label registro-label">Contraseña</label>
                <div className="input-group">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`form-control registro-input border-end-0 ${
                            errors.password
                            ? "is-invalid"
                            : form.password
                            ? "is-valid"
                            : ""        
                        }`}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        />
                    <button
                        type="button"
                        className="btn btn-outline-secondary toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                    {showPassword ? (
                    <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    ) : (
                    <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    )}
                    </button>
                    {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                    )}
                </div>
                {/* INDICADOR DE FUERZA PARA LA CONTRASEÑA */}
                {form.password && (
                <div className="mt-2">
                    <div className="password-strength-bar">
                        <div
                            className="password-strength-fill"
                            style={{
                                width: `${getPasswordStrength(form.password).pct}%`,
                                backgroundColor: getPasswordStrength(form.password).color,
                            }}
                        />
                    </div>
                    <small
                        style={{ color: getPasswordStrength(form.password).color }}
                    >
                        {getPasswordStrength(form.password).label}
                    </small>
                </div>
                )}
            </div>

            {/* - -PARA CONFIRMAR CONTRASEÑA- - */}
            <div className="mb-4">
                <label className="form-label registro-label">Confirmar contraseña</label>
                <div className="input-group">
                    <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmarPassword"
                        className={`form-control registro-input border-end-0 ${
                            errors.confirmarPassword
                            ? "is-invalid"
                            : form.confirmarPassword
                            ? "is-valid"
                            : ""
                        }`}
                        placeholder="••••••••"
                        value={form.confirmarPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary toggle-password"
                        onClick={() => setShowConfirm(!showConfirm)}
                        tabIndex={-1}
                    >
                    {showConfirm ? (
                        <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        ) : (
                        <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        )}
                    </button>
                    {errors.confirmarPassword && (
                        <div className="invalid-feedback">
                            {errors.confirmarPassword}
                        </div>
                    )}
                </div>
            </div>

            {/* BOTON SUBMIT */}
            <button
            type="button"
            className="btn-registro w-100 mb-3"
            onClick={handleSubmit}
            >Crear Cuenta</button>

            {/* LINK PARA EL LOGIN */}
            <p className="text-center text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            ¿Ya tienes una cuenta?{" "}
            <a href="#" className="registro-link">Iniciar sesión</a>
            </p>

            {/* BADGE SEGURO */}
            <div className="text-center">
                <span className="badge-seguro">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2d8a4e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    REGISTRO SEGURO
                </span>
            </div>
        </div>
        </div>
        <style>{styles}</style>
    </div>
);
};

// Función para calcular la fuerza de la contraseña
const getPasswordStrength = (password) => {

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { pct: 20, color: "#dc3545", label: "Muy débil" };
    if (score === 2) return { pct: 40, color: "#fd7e14", label: "Débil" };
    if (score === 3) return { pct: 60, color: "#ffc107", label: "Regular" };
    if (score === 4) return { pct: 80, color: "#20c997", label: "Fuerte" };
    return { pct: 100, color: "#198754", label: "Muy fuerte" };
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

.registro-wrapper {
    background: linear-gradient(135deg, #e8edf5 0%, #f0f4fb 50%, #e4ecf7 100%);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
}

.registro-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(26, 58, 107, 0.12);
    width: 100%;
    max-width: 500px;
    animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}

.registro-title {
    font-size: clamp(1.6rem, 4vw, 2rem);
    font-weight: 700;
    color: #1a1a2e;
    letter-spacing: -0.5px;
}

.registro-subtitle {
    color: #6b7280;
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 340px;
    margin: 0 auto;
}

.registro-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
}

.registro-input {
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 0.95rem;
    color: #1a1a2e;
    transition: border-color 0.2s, box-shadow 0.2s;
    background-color: #fafafa;
}

.registro-input:focus {
    border-color: #1a3a6b;
    box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.12);
    background-color: #fff;
}

.registro-input.is-valid {
    border-color: #198754;
    background-image: none;
}

.registro-input.is-invalid {
    border-color: #dc3545;
}

  /* Input con botón ojo */
.input-group .registro-input {
    border-right: none;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

.toggle-password {
    border: 1.5px solid #e5e7eb;
    border-left: none;
    border-radius: 0 10px 10px 0 !important;
    background: #fafafa;
    color: #9ca3af;
    padding: 0 12px;
    transition: color 0.2s;
}

.toggle-password:hover {
    color: #1a3a6b;
    background: #f0f4fb;
}

/*--Cuando el input tiene is-valid o is-invalid, el botón también--*/

.input-group:has(.is-valid) .toggle-password {
    border-color: #198754;
}

.input-group:has(.is-invalid) .toggle-password {
    border-color: #dc3545;
}

.btn-registro {
    background: #1a3a6b;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-size: 1rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    letter-spacing: 0.3px;
}

.btn-registro:hover {
    background: #142d54;
    box-shadow: 0 4px 16px rgba(26, 58, 107, 0.28);
    transform: translateY(-1px);
}

.btn-registro:active {
    transform: translateY(0);
}

.registro-link {
    color: #1a3a6b;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}

.registro-link:hover {
    color: #142d54;
    text-decoration: underline;
}

.badge-seguro {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #2d8a4e;
    letter-spacing: 1px;
    background: #f0faf4;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #c3e6cb;
}

  /* --Barra de fuerza de contraseña-- */
.password-strength-bar {
    height: 4px;
    background: #e5e7eb;
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 4px;
}

.password-strength-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.3s ease, background-color 0.3s ease;
}

  /* --Icono de éxito-- */
.success-icon svg {
    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
}

  /* --Responsive-- */
@media (max-width: 576px) {

.registro-card {
    border-radius: 16px;
    margin: 0 16px;
    }
}
`;

export default Registro;





