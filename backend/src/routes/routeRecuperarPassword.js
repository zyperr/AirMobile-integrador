import { Router } from "express";
import { solicitarRecuperacion } from "../controllers/controllerPassword.js";


const router = Router()


router.post("/",solicitarRecuperacion);



export default router;