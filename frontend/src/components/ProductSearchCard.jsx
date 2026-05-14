import { Link } from "react-router-dom"

export const ProductSearchCard = ({ nombre_producto, image_url, id ,...rest}) => {
    return (
        <div key={id}
            className="search-item">
            <Link className="text-decoration-none" to={`/producto/${id}`}  {...rest}>
                <img
                    src={image_url}
                    alt={nombre_producto}
                />

                <span>
                    {nombre_producto}
                </span>

            </Link>

        </div>

    )
}