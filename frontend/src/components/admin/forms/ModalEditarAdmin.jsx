import { useState, useEffect } from "react";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../context/AuthContext";
import { InputGenerico } from "../../common/InputGenerico";

const ModalEditarAdmin = ({ isOpen, onClose, admin, onAdminActualizado }) => {
  const { token } = useAuth();
  const { ejecutarPeticion, isLoading } = useApi();
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
  });

  // Precargamos los datos del admin cuando se abre el modal
  useEffect(() => {
    if (admin) {
      setForm({
        nombre: admin.nombre || "",
        email: admin.email || "",
      });
      setError(null);
    }
  }, [admin]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Solo mandamos los campos que cambiaron
    const datosAActualizar = {};
    if (form.nombre !== admin.nombre) datosAActualizar.nombre = form.nombre;
    if (form.email !== admin.email) datosAActualizar.email = form.email;

    // Si no cambió nada cerramos el modal directamente
    if (Object.keys(datosAActualizar).length === 0) {
      onClose();
      return;
    }

    const result = await ejecutarPeticion(`staff/${admin.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosAActualizar),
    });

    if (result.exito) {
      onAdminActualizado(admin.id, datosAActualizar);
      onClose();
    } else {
      setError(result.error || "No se pudo actualizar el administrador.");
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">Editar Administrador</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit} id="formEditarAdmin">
              <div className="row g-3">
                {/* Nombre */}
                <div className="col-12">
                  <InputGenerico
                    label="Nombre"
                    name="nombre"
                    type="text"
                    placeholder="Nombre completo"
                    value={form.nombre}
                    onChange={handleChange}
                    minLength="3"
                    maxLength="50"
                  />
                </div>

                <div className="col-12">
                  <InputGenerico
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="formEditarAdmin"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarAdmin;
