import cloudinary from '../config/cloudinarySetup.js';
import { Readable } from 'stream';

const subirACloudinary = (buffer, categoria, nombre) => {
    const rutaCarpeta = `productos/${categoria.toLowerCase()}`
    const nombreSeguro = `${nombre}-${Date.now()}`.trim().toLowerCase()
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: rutaCarpeta, public_id: nombreSeguro, transformation: { quality: 'auto', fetch_format: 'auto' } },

            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        Readable.from(buffer).pipe(stream);
    });
};



const eliminarDeCloudinary = async (url) => {
    try {
        if (!url) return;


        const partesUrl = url.split('/upload/');
        if (partesUrl.length < 2) return;

        const rutaYArchivo = partesUrl[1];


        const fragmentos = rutaYArchivo.split('/');
        fragmentos.shift();


        const rutaLimpia = fragmentos.join('/');


        const public_id = rutaLimpia.split('.')[0];

        const resultado = await cloudinary.uploader.destroy(public_id);

        console.log(`Imagen eliminada de Cloudinary: ${public_id} - Resultado:`, resultado.result);

        return resultado;

    } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error);
    }
};
const extraerPublicId = (url) => {
    try {
        // Ejemplo de URL: ".../upload/q_auto/f_auto/v1778663127/productos/tablets/imagen.webp"
        const partes = url.split('/upload/');
        if (partes.length < 2) return null;

        let ruta = partes[1]; // Nos queda: "q_auto/f_auto/v1778663127/productos/tablets/imagen.webp"

        // Dividimos la ruta en partes usando las barras '/'
        let segmentos = ruta.split('/');

        // Buscamos exactamente en qué posición está la versión de Cloudinary (ej: "v1778663127")
        // La expresión regular /^v\d+$/ significa: Empieza con 'v' y le siguen solo números.
        const indiceVersion = segmentos.findIndex(seg => /^v\d+$/.test(seg));

        if (indiceVersion !== -1) {
            // Si encontramos la versión, cortamos el arreglo para quedarnos solo con lo que viene DESPUÉS
            segmentos = segmentos.slice(indiceVersion + 1);
        } else {
            // Si por algún motivo no hay versión, limpiamos transformaciones comunes por las dudas
            segmentos = segmentos.filter(seg => !/^[a-z]_/.test(seg) && !seg.includes(','));
        }

        // Volvemos a unir lo que quedó
        ruta = segmentos.join('/');

        // Le quitamos la extensión final (.jpg, .webp, etc.)
        const ultimoPunto = ruta.lastIndexOf('.');
        if (ultimoPunto !== -1) {
            ruta = ruta.substring(0, ultimoPunto);
        }
        const publicIdLimpio = decodeURIComponent(ruta);

        return publicIdLimpio;
    } catch (e) {
        console.error("Error extrayendo public_id:", e);
        return null;
    }
};

// Función 2: La nueva función principal de borrado inteligente
const borrarImagenesDescartadas = async (layoutJson, imagenesViejasJson) => {
    if (!layoutJson) return;

    try {
        // Parseamos los datos de forma segura
        const layout = typeof layoutJson === 'string' ? JSON.parse(layoutJson) : layoutJson;
        const urlsViejas = typeof imagenesViejasJson === 'string' ? JSON.parse(imagenesViejasJson || "[]") : (imagenesViejasJson || []);

        // Filtramos qué se queda y qué se va
        const urlsAConservar = layout.filter(item => item !== 'NUEVA_IMAGEN');
        const urlsABorrar = urlsViejas.filter(url => !urlsAConservar.includes(url));

        // Borramos las sobrantes de Cloudinary
        for (const url of urlsABorrar) {
            const publicId = extraerPublicId(url);
            console.log("🗑️ Mandando a borrar a Cloudinary el ID:", publicId);
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error(`Error borrando en Cloudinary la img ${publicId}:`, err);
                }
            }
        }
    } catch (error) {
        console.error("Error al procesar el borrado inteligente de imágenes:", error);
    }
};


export { subirACloudinary, eliminarDeCloudinary, extraerPublicId, borrarImagenesDescartadas }