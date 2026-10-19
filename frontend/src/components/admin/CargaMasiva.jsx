import { useState, useRef } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";

const CargaMasivaAdmin = () => {
    const [dragging, setDragging] = useState(false);
    const [archivo, setArchivo] = useState(null);
    const [resultado, setResultado] = useState(null);
    const { ejecutarPeticion, isLoading } = useApi();
    const { token } = useAuth();
    const inputRef = useRef(null);

    const EXTENSIONES_VALIDAS = [".xlsx", ".csv", ".json"];

    const validarArchivo = (file) => {
        if (!file) return false;
        const ext = "." + file.name.split(".").pop().toLowerCase();
        return EXTENSIONES_VALIDAS.includes(ext);
    };

    const seleccionarArchivo = (file) => {
        setResultado(null);
        if (!validarArchivo(file)) {
            setResultado({ tipo: "error", mensaje: "Formato no válido. Solo se aceptan .csv" });
            return;
        }
        setArchivo(file);
    };

    // ✅ detectarSeparador fuera de subirArchivo
    const detectarSeparador = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const primeraLinea = e.target.result.split("\n")[0];
                const comas = (primeraLinea.match(/,/g) || []).length;
                const puntoYComas = (primeraLinea.match(/;/g) || []).length;
                resolve(puntoYComas > comas ? ";" : ",");
            };
            reader.readAsText(file);
        });
    };

    const ArchivoEncima = (e) => { e.preventDefault(); setDragging(true); };
    const ArchivoSinSoltar = () => setDragging(false);
    const SoltarArchivo = (e) => {
        e.preventDefault();
        setDragging(false);
        seleccionarArchivo(e.dataTransfer.files[0]);
    };
    const ArchivoBoton = (e) => seleccionarArchivo(e.target.files[0]);

    const limpiar = () => {
        setArchivo(null);
        setResultado(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    // ✅ subirArchivo ahora es una sola función, sin anidar
    const subirArchivo = async () => {
        if (!archivo) return;

        const formData = new FormData();
        formData.append("archivo", archivo);

        const esCsv = archivo.name.endsWith(".csv");
        if (esCsv) {
            const separador = await detectarSeparador(archivo);
            formData.append("separator", separador);
        }

        const respuesta = await ejecutarPeticion("productos/carga-masiva", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (respuesta.exito) {
            setResultado({ tipo: "exito", mensaje: respuesta.data.message });
            setArchivo(null);
            if (inputRef.current) inputRef.current.value = "";
        } else {
            const mensaje = respuesta.data?.detalle || respuesta.data?.message || "Error al procesar el archivo.";
            setResultado({ tipo: "error", mensaje });
        }
    };

    return (
        <div className="carga-card">
            <div
                className={`carga-zona ${dragging ? "carga-zona-activa" : ""}`}
                onDragOver={ArchivoEncima}
                onDragLeave={ArchivoSinSoltar}
                onDrop={SoltarArchivo}
            >
                <div className="carga-icono-wrapper mb-3">
                    <i className={`bi ${isLoading ? "bi-hourglass-split" : "bi-file-earmark-arrow-up"} carga-icono`} />
                </div>

                <h3 className="carga-titulo">Carga masiva de inventario</h3>
                <p className="carga-subtitulo">
                    Arrastrá y soltá tu archivo CSV para
                    actualizar los niveles de existencias de forma masiva.
                </p>

                {archivo && (
                    <div className="carga-archivo-seleccionado">
                        <i className="bi bi-file-earmark-check me-2" />
                        {archivo.name}
                        <button
                            onClick={limpiar}
                            style={{ background: "none", border: "none", marginLeft: 8, cursor: "pointer", color: "#6b7280", fontSize: 14 }}
                            title="Quitar archivo"
                        >
                            <i className="bi bi-x-circle" />
                        </button>
                    </div>
                )}

                {resultado && (
                    <div
                        className="mt-3 px-3 py-2 rounded"
                        style={{
                            background: resultado.tipo === "exito" ? "#f0fdf4" : "#fef2f2",
                            border: `1px solid ${resultado.tipo === "exito" ? "#86efac" : "#fca5a5"}`,
                            color: resultado.tipo === "exito" ? "#166534" : "#991b1b",
                            fontSize: 13,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <i className={`bi ${resultado.tipo === "exito" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`} />
                        {resultado.mensaje}
                    </div>
                )}

                <div className="d-flex gap-3 justify-content-center mt-3 flex-wrap">
                    <input
                        ref={inputRef}
                        type="file"
                        id="carga-input"
                        accept=".xlsx,.csv,.json"
                        style={{ display: "none" }}
                        onChange={ArchivoBoton}
                    />

                    <label htmlFor="carga-input" className="carga-btn-subir">
                        <i className="bi bi-folder2-open me-1" /> Elegir archivo
                    </label>

                    {archivo && (
                        <button
                            className="admin-btn-nuevo"
                            onClick={subirArchivo}
                            disabled={isLoading}
                            style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                        >
                            {isLoading
                                ? <><i className="bi bi-hourglass-split me-1" />Procesando...</>
                                : <><i className="bi bi-cloud-upload me-1" />Procesar archivo</>
                            }
                        </button>
                    )}
                    <a

                        href="https://docs.google.com/spreadsheets/d/1zrMff3cmG3PkItB-zuNAdFfNId9Cwv2t/export?format=xlsx"
                        download="Plantilla_Inventario.xlsx"
                        className="carga-btn-descargar"
                        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}

                    >
                        <i className="bi bi-download me-1" /> Descargar plantilla
                    </a>
                </div>

                <p className="carga-info mt-3">
                    TAMAÑO MÁXIMO: 25 MB • FORMATOS: .CSV - Separado por comas
                </p>
            </div>
        </div>
    );
};

export default CargaMasivaAdmin;