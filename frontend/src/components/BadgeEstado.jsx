//Componente para chequear el estado de los productos(Nuevo, Usado, Reacondicionado)
const BadgeEstado = ({estado}) => {

    const clases ={
        "Nuevo": "badge-nuevo",
        "Reacondicionado": "badge-reacondicionado",
        "Usado": "badge-usado",
    };

    //si el estado no existe usamos una clase por defecto
    const clase = clases[estado] || "badge-desconocido";

    return (
        <span className={`badge-estado ${clase}`}>
            {estado}
        </span>
    );
};
export default BadgeEstado;