// Para subir archivos Excel o CSV para actualizar el inventario
import { useState } from "react";

const CargaMasivaAdmin = () => {

    // Estados para manejar el drag & drop y el archivo seleccionado
    const [dragging, setDragging] = useState(false);
    const [archivo, setArchivo] = useState(null);

    // Cuando el usuario arrastra un archivo encima
    const ArchivoEncima = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    // Cuando el usuario saca el archivo sin soltar
    const ArchivoSinSoltar = () => {
        setDragging(false);
    };

    // Cuando el usuario suelta el archivo
    const SoltarArchivo = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) setArchivo(file);
    };

    // Cuando el usuario selecciona un archivo con el botón
    const ArchivoBoton = (e) => {
        const file = e.target.files[0];
        if (file) setArchivo(file);
    };

    return (
        <div className="carga-card">
            {/* ZONA DE DRAG & DROP */}
            <div
                className={`carga-zona ${dragging ? "carga-zona-activa" : ""}`}
                onDragOver={ArchivoEncima}
                onDragLeave={ArchivoSinSoltar}
                onDrop={SoltarArchivo}
            >
                {/* ÍCONO */}
                <div className="carga-icono-wrapper mb-3">
                    <i className="bi bi-file-earmark-arrow-up carga-icono" />
                </div>

                {/* TEXTO */}
                <h3 className="carga-titulo">Carga masiva de inventario</h3>
                <p className="carga-subtitulo">
                    Arrastra y suelta aquí tu archivo Excel o CSV para
                    actualizar los niveles de existencias de forma masiva.
                </p>

                {/* ARCHIVO SELECCIONADO */}
                {archivo && (
                    <div className="carga-archivo-seleccionado">
                        <i className="bi bi-file-earmark-check me-2" />
                        {archivo.name}
                    </div>
                )}

                {/* BOTONES */}
                <div className="d-flex gap-3 justify-content-center mt-3">

                    {/* Input oculto para seleccionar archivo */}
                    <input
                        type="file"
                        id="carga-input"
                        accept=".xlsx,.csv"
                        style={{ display: "none" }}
                        onChange={ArchivoBoton}
                    />

                    <label htmlFor="carga-input" className="carga-btn-subir"> Subir Archivo</label>

                    <button className="carga-btn-descargar"> Descargar plantilla</button>
                </div>

                {/* INFO DE FORMATOS */}
                <p className="carga-info mt-3">
                    TAMAÑO MÁXIMO DEL ARCHIVO: 25 MB • FORMATOS: .XLSX, .CSV
                </p>

            </div>

        </div>
    );
};

export default CargaMasivaAdmin;