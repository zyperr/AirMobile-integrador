// src/components/FiltroRadioGroup.jsx

const FiltroRadioGroup = ({ 
    titulo, 
    opciones, 
    valorSeleccionado, 
    onChange, 
    nombreGrupo, 
    textoOpcionTodas 
}) => {
    return (
        <div className="mb-4 pb-3 border-bottom">
            <h4 className="text-secondary text-uppercase mb-3" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
                {titulo}
            </h4>
            
            {/* Botón para deseleccionar / "Todas" */}
            <div className="form-check custom-dropdown-check mb-2">
                <input
                    className="form-check-input custom-checkbox"
                    type="radio"
                    name={nombreGrupo}
                    id={`${nombreGrupo}-todas`}
                    checked={valorSeleccionado === ''}
                    onChange={() => onChange('')} 
                />
                <label 
                    className="form-check-label text-dark w-100" 
                    htmlFor={`${nombreGrupo}-todas`} 
                    style={{ cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
                >
                    {textoOpcionTodas}
                </label>
            </div>

            {/* Mapeo dinámico de las opciones */}
            {opciones.map((opcion, index) => (
                <div className="form-check mb-2" key={index}>
                    <input 
                        className="form-check-input custom-checkbox"
                        type="radio"
                        name={nombreGrupo}
                        id={`${nombreGrupo}-${index}`}
                        checked={valorSeleccionado === opcion}
                        onChange={() => onChange(opcion)}
                    />
                    <label 
                        className="form-check-label text-dark w-100 text-capitalize" 
                        htmlFor={`${nombreGrupo}-${index}`} 
                        style={{ cursor: "pointer", fontSize: "14px" }}
                    >
                        {opcion}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default FiltroRadioGroup;