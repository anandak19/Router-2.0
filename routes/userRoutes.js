import express from "express"
import { registerAdmin, loginUser, addClient } from "../controllers/userController.js";
import { authenticateAdmin, validateInputs, validateToken } from "../middlewares/auth.js";

const router = express.Router()

router.post("/user/register/admin", validateInputs, registerAdmin)
router.post("/user/register",validateToken, authenticateAdmin, validateInputs, addClient)
router.post("/user/login", loginUser)

export default router;