import bcrypt from 'bcryptjs';

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (error, user) => {
        if (error) {
            return res.status(403).json({ error: "Token inválido" });
        }
        req.user = user; // Guardamos el ID y el email del usuario en req.user para usarlo en las rutas protegidas
        next();
    })
}


export const comprobarContraseña = async ( password,userPassword) => {
    // compareSync toma la contraseña plana y la compara con el hash guardado. Devuelve true o false.
    return await bcrypt.compare(password,userPassword)
}