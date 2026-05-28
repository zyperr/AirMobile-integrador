export const InputGenerico = ({ label, name, type = "text", placeholder, register, reglas, errors }) => {
    // React Hook Form guarda el texto del error en errors.message
    const errorMessage = errors?.message;

    return (
        <div className="mb-3 text-start">
            <label htmlFor={name} className="form-label registro-label">{label}</label>
            <input
                id={name}
                type={type}
                className={`form-control registro-input ${errorMessage ? 'is-invalid' : ''}`}
                placeholder={placeholder}
                autoComplete={type}
                {...register(name, reglas)} // Inyectamos todo de una
            />
            {errorMessage && (
                <span className="text-danger text-small d-block mt-1 text-start">
                    {errorMessage}
                </span>
            )}
        </div>
    );
};