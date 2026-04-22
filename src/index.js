

//const expreess = require('express');
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
import expreess from 'express';
import routesUsuarios from './routes/routesUsuarios.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';




const PORT = 3000;
const app = expreess();
app.use(expreess.json())

app.use("/api/usuarios", routesUsuarios);




app.get("", (req, res) => {
    res.send("hola");
})


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})