

//const expreess = require('express');
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
import expreess from 'express';
import routesUsuarios from './routes/routesUsuarios.js';
import routesProductos from "./routes/routesProductos.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inicializarBaseDeDatos } from './config/initDB.js'; 

import routesCarrito from './routes/routesCarrito.js';
import routeResetPassword  from "./routes/routeResetPassword.js"
import routeRecuperarPassword from "./routes/routeRecuperarPassword.js"


const PORT = 3000;
const app = expreess();





app.use(expreess.json())

app.use("/api/usuarios", routesUsuarios);
app.use("/api/productos",routesProductos)
app.use("/api/carrito", routesCarrito);

app.use("/api/recuperar-password",routeRecuperarPassword)
app.use("/api/reset-password",routeResetPassword)


app.get("", (req, res) => {
    res.send("hola");
})


app.listen(PORT, async () => {
    await inicializarBaseDeDatos()
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    
})