export const InputGenerico = ({
    label,
    name,
    type = "text",
    placeholder,
    register,
    reglas,
    errors,
    value,      // NUEVO: Para usar con useState (Modal)
    onChange,   // NUEVO: Para usar con useState (Modal)
    isPrice = false,
    ...rest     // NUEVO: Para atrapar required, minLength, step, etc.
}) => {

    // Soportamos errores tanto de React Hook Form (objeto) como strings directos
    const errorMessage = typeof errors === 'string' ? errors : errors?.message;

    // MAGIA HÍBRIDA: Si viene 'register', lo ejecutamos. Si no, devolvemos un objeto vacío.
    const hookFormProps = register ? register(name, reglas) : {};

    return (
        <div className="text-start mb-3">
            {/* Clases actualizadas al diseño premium */}
            <label htmlFor={name} className="form-label text-muted small fw-bold text-uppercase mb-1">
                {label}
            </label>
            <div className="input-group">
                {isPrice && <span className="input-group-text bg-light ">$</span>}
                <input
                    id={name}
                    name={name}
                    type={type}
                    className={`form-control registro-input ${errorMessage ? 'is-invalid' : ''}`}
                    placeholder={placeholder}
                    autoComplete={type}
                    value={value}
                    onChange={onChange}
                    {...rest} // Inyecta properties extras como 'required' o 'step'
                    {...hookFormProps} // Inyecta las funciones de React Hook Form (solo si existen)
                />
            </div>


            {errorMessage && (
                <span className="invalid-feedback d-block text-start text-small mt-1">
                    {errorMessage}
                </span>
            )}
        </div>
    );
};