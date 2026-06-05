//Componente para chequear el estado de los productos(Nuevo, Usado, Reacondicionado)
const BadgeEstado = ({estado}) => {

    const clases ={
        "Nuevo": "badge-nuevo",
        "Reacondicionado": "badge-reacondicionado",
        "Usado": "badge-usado",
    };

    // Normalizamos: primera letra mayúscula, resto minúscula
    const estadoNormalizado = estado
        ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()
        : "";

    const clase = clases[estadoNormalizado] || "badge-desconocido";


    return (
        <span className={`badge-estado ${clase}`}>
            {estado}
        </span>
    );
};
export default BadgeEstado;