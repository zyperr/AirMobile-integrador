import { Router } from "express";
import { resetearPasswordOlvidada } from "../controllers/controllerPassword.js";


const router = Router()


router.post("/",resetearPasswordOlvidada);


export default router;