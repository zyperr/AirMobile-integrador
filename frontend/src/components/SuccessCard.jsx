import { Link } from "react-router-dom";
export const SuccessCard = ({ mensaje, descripcion, setSubmitted,text,linkTo}) => {
    return (
        <div className="registro-wrapper  py-4 animate__animated animate__fadeIn d-flex flex-column align-items-center">
            <div className=" registro-card text-center p-5">
                <div className="mb-4 ">
                    <i class="bi bi-check-circle-fill fs-1 text-success"></i>
                </div>
                <h3 className="fw-bold mb-2">
                    {mensaje}
                </h3>
                <p className="text-muted">
                    {descripcion}
                </p>
                <Link to={linkTo}>
                    <button className="btn-registro w-100 mb-3"
                        onClick={() => {
                            setSubmitted(false);
                        }}>
                        {text}
                    </button>
                </Link>
            </div>
        </div>
    );
}