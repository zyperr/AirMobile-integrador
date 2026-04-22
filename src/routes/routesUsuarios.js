import { Router } from "express";
import { obtenerUsuarios,registro,login, actualizarContrasena,verificar} from "../controllers/controlerUsuario.js";
import { verificarToken } from "../middlewares/authMiddleware.js";


const router = Router();


router.get("/usuarios",obtenerUsuarios );

router.post("/registro",registro);

router.post("/login",login);

router.post("/verificar",verificarToken,verificar)

router.put("/actualizar",verificarToken,actualizarContrasena);

// Esta función intercepta las peticiones antes de que lleguen a la ruta protegida
router.get('/perfil', verificarToken, (req, res) => {
    // Si llegó hasta aquí, es porque el middleware lo dejó pasar
    res.json({
        mensaje: "¡TOKEN VERIFICADO!",
        datosDelToken: req.usuario // Aquí están el ID y el email que guardamos en el token
    });
});


export default router