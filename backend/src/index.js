

//const expreess = require('express');
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
import expreess from 'express';
import routesUsuarios from './routes/routesUsuarios.js';
import routesProductos from "./routes/routesProductos.js"
import { inicializarBaseDeDatos } from './config/initDB.js'; 
import routesCarrito from './routes/routesCarrito.js';
import routeResetPassword  from "./routes/routeResetPassword.js"
import routeRecuperarPassword from "./routes/routeRecuperarPassword.js"
import routeFacturas from "./routes/routesFacturas.js";
import routesListaDeseados from "./routes/routesListaDeseados.js"
import routeStaff from "./routes/routesAdmin.js"

import cors from "cors";

const corsOptions = {
  // Aquí pones la URL exacta donde corre tu React
  origin: ['http://localhost:5173', 'https://tu-dominio-final.com'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Muy importante para que pasen tus JWT
  credentials: true // Permite el envío de cookies si las llegas a usar
};




const PORT = 3000;
const api = "/api";



const app = expreess();

app.use(cors(corsOptions));



app.use(expreess.json())

app.use(`${api}/usuarios`, routesUsuarios);
app.use(`${api}/productos`,routesProductos)
app.use(`${api}/carrito`, routesCarrito);

app.use(`${api}/recuperar-password`,routeRecuperarPassword)
app.use(`${api}/reset-password`,routeResetPassword)
app.use(`${api}/facturas`, routeFacturas);


app.use(`${api}/lista-deseados`, routesListaDeseados);

app.use(`${api}/staff`,routeStaff )

app.get("", (req, res) => {
    res.send("hola");
})


app.listen(PORT, async () => {
    await inicializarBaseDeDatos()
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    
})