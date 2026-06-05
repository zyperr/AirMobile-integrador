import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useApi } from "../../../hooks/useApi";

const InformacionGeneral = () => {
    // 1. Extraemos las herramientas que nos pasó el Layout padre
    const { datosUsuario, setDatosUsuario, setNotificacion } = useOutletContext();

    // 2. Estados locales propios de este componente
    const [nombre, setNuevoNombre] = useState(datosUsuario.nombre);
    const { ejecutarPeticion: actualizarNombre, isLoading: guardandoNombre } = useApi();


    const handleActualizarNombre = async () => {
        if (!nombre || nombre.trim() === '') return;

        const response = await actualizarNombre('usuarios/actualizar-nombre', {
            method: 'PUT',
            body: JSON.stringify({ nombre: nombre })
        });

        if (response.exito) {
            setDatosUsuario(prevDatos => ({
                ...prevDatos,
                nombre: response.data.data.nombre
            }));

            setNotificacion({
                mostrar: true,
                mensaje: "¡Perfil Actualizado!",
                descripcion: "Tu nombre de usuario ha sido guardado correctamente."
            });
        }
    }

    return (
        <section className="mb-5 slide-down-animation">
            <h3 className="fs-4 fw-bold mb-3">Información General</h3>
            <div className="bg-light p-4 rounded-3">
                <div className="d-flex align-items-center mb-4">
                    <div className="rounded-circle bg-secondary bg-opacity-25 d-flex justify-content-center align-items-center fw-bold text-dark fs-4 me-3" style={{ width: "60px", height: "60px" }}>
                        {datosUsuario.nombre.charAt(0).toUpperCase()}{datosUsuario.nombre.split(' ')[1]?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h5 className="m-0 fw-bold fs-6">{datosUsuario.nombre}</h5>
                        <span className="badge bg-primary mt-1">{datosUsuario.rol}</span>
                    </div>
                </div>
                <form>
                    <div className="mb-4">
                        <label className="form-label text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Nombre de Usuario</label>
                        <input
                            type="text"
                            className="form-control border-0 py-2 shadow-sm"
                            defaultValue={datosUsuario.nombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-primary px-4 py-2 fw-semibold"
                            onClick={handleActualizarNombre}
                            disabled={guardandoNombre || nombre === datosUsuario.nombre}
                        >
                            {guardandoNombre ? "Guardando..." : "Guardar Nombre"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default InformacionGeneral;