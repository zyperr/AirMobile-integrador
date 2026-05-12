import { useState } from "react";
import "../style/Registro.css";

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
    <div className="registro-wrapper d-flex align-items-center justify-content-center ">
        <div className="registro-card text-center p-5">
            <div className="success-icon mb-4 ">
                <i class="bi bi-check-circle-fill fs-1 text-success-emphasis"></i>
            </div>
            <h3 className="fw-bold mb-2">
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
        
    </div>
    );
}

return (
    <div className="registro-wrapper">

        <div className="registro-card p-4 p-md-5">
        {/* --HEADER-- */}
            <div className="text-center mb-4">
                <h1 className="registro-title mb-2">Crea tu cuenta</h1>
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
                    <i class="bi bi-eye w-18"></i>
                    ) : (
                    <i class="bi bi-eye-slash w-18"></i>
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
                        <i class="bi bi-eye w-18"></i>
                        ) : (
                        <i class="bi bi-eye-slash w-18"></i>
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
                <span className="badge-seguro fs-6">
                    <i class="bi bi-shield-lock "></i>
                    REGISTRO SEGURO
                </span>
            </div>
        </div>
        </div>
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


export default Registro;





