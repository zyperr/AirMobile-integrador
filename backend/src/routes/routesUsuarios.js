import { Router } from "express";
import { obtenerUsuarios,registro,login,verificar, obtenerPerfil, actualizarNombreUsuario, cerrarSesion, actualizarCorreoUsuario} from "../controllers/controlerUsuario.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { actualizarContrasena } from "../controllers/controllerPassword.js";
import { renovarSesion } from "../controllers/controlerUsuario.js";

const router = Router();

// Rutas para usuarios
//http://localhost:3000/api/usuarios/ 

router.get("/usuarios",obtenerUsuarios );

router.post("/registro",registro);

router.post("/login",login);



router.post("/verificar",verificarToken,verificar)

router.put("/actualizar",verificarToken,actualizarContrasena);

router.put("/actualizar-nombre",verificarToken,actualizarNombreUsuario);

router.put("/actualizar-correo",verificarToken,actualizarCorreoUsuario);

router.post('/logout', cerrarSesion);
router.post('/refresh', renovarSesion);

// Esta función intercepta las peticiones antes de que lleguen a la ruta protegida
router.get('/perfil', verificarToken, (req, res) => {
    // Si llegó hasta aquí, es porque el middleware lo dejó pasar
    res.json({
        mensaje: "¡TOKEN VERIFICADO!",
        data: req.user // Aquí están el ID,email,rol
    });
});

router.get("/mi-perfil", verificarToken,obtenerPerfil);


export default router