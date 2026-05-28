export function Condition({ condicion }) {
    return (
        <div className="d-flex gap-2">
            <span
                key={condicion}
                className={`btn btn-sm px-3 py-2 rounded-3 fw-medium btn-primary`}
                style={{ fontSize: "0.85rem" }}
            >
                {condicion}
            </span>
            <a href="#" className="ms-auto text-primary text-decoration-none align-self-center" style={{ fontSize: "0.82rem" }}>Guía de condiciones</a>
        </div>
    );
}