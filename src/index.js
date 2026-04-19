

const expreess = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const PORT = 3000;
const app = expreess();


const SECRET_KEY = "mi_llave_super_secreta_e_indescifrable";

app.use(expreess.json());


let usuarios = [];


app.get('/usuarios', (req, res) => {

    const usuariosFiltrados = usuarios.map((usuario) => {
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
        }
    })
    res.json(usuariosFiltrados);
})


app.get("", (req, res) => {
    res.send("hola");
})


app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "El email y la contraseña son obligatorios" });
    }
    const usuarioEncontrado = usuarios.find(usuario => usuario.email === email);

    if (!usuarioEncontrado) {
        return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // compareSync toma la contraseña plana y la compara con el hash guardado. Devuelve true o false.
    const passwordValida = bcrypt.compareSync(password, usuarioEncontrado.password);

    if (!passwordValida) {
        return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
        { id: usuarioEncontrado.id, email: usuarioEncontrado.email },
        SECRET_KEY,
        { expiresIn: '1h' } // La pulsera caduca en 1 hora por seguridad
    )

    const datosUsuario = {
        id: usuarios.id,
        nombre: usuarios.nombre,
    }

    res.status(200).json({
        mensaje: "¡Login exitoso!",
        token: token, // Le enviamos el token al cliente
        datosUsuario: datosUsuario
    });
})

app.post('/usuarios', (req, res) => {

    const { nombre, email, password } = req.body;

    if (!password) {
        return res.status(400).json({
            error: "Password es requerido"
        })
    }

    const usuarioExistente = usuarios.find(usuario => usuario.email === email);
    if (usuarioExistente) {
        return res.status(400).json({
            error: "El usuario ya existe"
        })
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const nuevoUsuario = {
        id: usuarios.length + 1,
        nombre: nombre,
        email: email,
        password: passwordHash
    }

    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario);

})


// Esta función intercepta las peticiones antes de que lleguen a la ruta protegida
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (error, user) => {
        if (error) {
            return res.status(403).json({ error: "Token inválido" });
        }
        req.user = user;
        next();
    })
}

app.get('/perfil', verificarToken, (req, res) => {
    // Si llegó hasta aquí, es porque el middleware lo dejó pasar
    res.json({
        mensaje: "¡TOKEN VERIFICADO!",
        datosDelToken: req.usuario // Aquí están el ID y el email que guardamos en el token
    });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})