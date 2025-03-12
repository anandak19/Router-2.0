import express from "express"
import { registerAdmin, loginUser, addClient, getLatestTransaction } from "../controllers/userController.js";
import { authenticateAdmin, validateInputs, validateToken } from "../middlewares/auth.js";

const router = express.Router()

router.post("/user/register/admin", validateInputs, registerAdmin)
router.post("/user/register", validateToken, authenticateAdmin, validateInputs, addClient)
router.post("/user/login", loginUser)
// get the last transaction / cash collection made on user 
router.get("/user/transactions/latest", validateToken, getLatestTransaction)

export default router;