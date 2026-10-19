import multer from 'multer';


const storage = multer.memoryStorage();

const filtroImagenes = (req, file, cb) => {

    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (formatosPermitidos.includes(file.mimetype)) {
        // El archivo es válido
        cb(null, true);
    } else {
        // El archivo no es válido, lanzamos un error y frenamos la subida: false
        cb(new Error('Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'), false);
    }
};


export const uploadImg = multer({ 
    storage: storage,
    fileFilter: filtroImagenes,
    limits: { 
        fileSize: 5 * 1024 * 1024 // Límite de 5 MB por imagen
    }
});

