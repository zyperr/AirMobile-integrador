import { useState } from "react";
import { Link } from "react-router-dom";
const InputPassword = ({ label, name, placeholder, register, reglas, errors,linkRecuperacion }) => {
    const [show, setShow] = useState(false);
    const errorMessage = errors?.message;

    return (
        <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label registro-label mb-0">{label}</label>
                {linkRecuperacion && (
                    <Link to={linkRecuperacion} className="fw-light registro-link text-decoration-none" style={{ fontSize: "0.85rem" }}>
                        ¿Olvidaste tu contraseña?
                    </Link>
                )}
            </div>
            <div className="input-group">
                <input
                    type={show ? "text" : "password"}
                    className={`form-control registro-input border-end-0 ${errorMessage ? "is-invalid" : ""}`}
                    placeholder={placeholder}
                    {...register(name, reglas)}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary toggle-password"
                    onClick={() => setShow(!show)}
                    tabIndex={-1}
                >
                    <i className={`bi ${show ? "bi-eye" : "bi-eye-slash"} w-18`}></i>
                </button>
                {/* El invalid-feedback con d-block para que no rompa el diseño del input-group */}
                {errorMessage && <div className="invalid-feedback d-block text-start">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default InputPassword;