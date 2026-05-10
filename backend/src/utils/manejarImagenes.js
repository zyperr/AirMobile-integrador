import cloudinary from '../config/cloudinarySetup.js';
import { Readable } from 'stream';

export const subirACloudinary = (buffer, categoria, nombre) => {
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

export const eliminarDeCloudinary = async (url) => {
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