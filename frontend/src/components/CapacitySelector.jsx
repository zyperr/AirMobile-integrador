import { useState, useEffect } from "react";
export function CapacitySelector({ capacidadesBackend, precioBase = 0 }) {

  const opcionesCapacidad = capacidadesBackend?.map((cap, index) => {
    let costoExtra = 0;

    // Regla de negocio: El índice 0 es el base ($0). Le sumamos al resto.
    if (index === 1) costoExtra = 100;
    if (index === 2) costoExtra = 250;
    if (index === 3) costoExtra = 400; // Por si llega a venir un 4to (ej: 1TB)

    return {
      id: cap,       // Ej: "128GB"
      label: cap,    // Ej: "128GB"
      extra: costoExtra,
      texto: costoExtra === 0 ? "Estándar" : `+$${costoExtra}`
    };
  });

  const [seleccionado, setSeleccionado] = useState("");

  useEffect(() => {
    if (capacidadesBackend.length > 0) {
      setSeleccionado(capacidadesBackend[0]);
    }
  }, [capacidadesBackend]);

  const opcionElegida = opcionesCapacidad.find(op => op.id === seleccionado);
  const extraCosto = opcionElegida ? opcionElegida.extra : 0;
  const precioTotal = precioBase + extraCosto;


  return (
    <div className="mb-4">
      <h5 className="mb-3">Elige la capacidad</h5>

      <div className="d-flex gap-2">
        {opcionesCapacidad.map((opcion) => {
          const isActive = seleccionado === opcion.id;

          return (
            <div
              key={opcion.id}
              onClick={() => setSeleccionado(opcion.id)}
              className={`p-3 rounded-3 text-center flex-fill border ${isActive ? 'border-primary border-2 bg-light' : 'border-secondary-subtle'}`}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div className="fw-bold fs-5 text-dark">{opcion.label}</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                {opcion.texto}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-light rounded-3">
        <h4 className="mb-0">Precio Final: <span className="text-primary">${precioTotal}</span></h4>
      </div>
    </div>
  );
};
