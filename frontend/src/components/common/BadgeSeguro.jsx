export const BadgeSeguro = ({mensaje}) => {
    return (
        <div className="text-center">
            <span className="badge-seguro fs-6">
                <i class="bi bi-shield-lock "></i>
                {mensaje}
            </span>
        </div>
    )
}