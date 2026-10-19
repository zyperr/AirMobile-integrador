export const verificarAdmin = (req, res, next) => {
    // Para que este middleware funcione, siempre tiene que ejecutarse DESPUÉS de verificarToken
    if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador." });
    }

    next(); // Si es admin, lo deja pasar a la ruta
}