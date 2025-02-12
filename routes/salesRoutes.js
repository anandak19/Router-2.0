import express from "express"
import { validateToken } from "../middlewares/auth.js";
import { varifyRouter } from "../middlewares/routerValidations.js";
import { getSalesByRouter, totalSalesByUser } from "../controllers/salesController.js";

const router = express.Router()


// get the vouchers under the router 
router.get("/router/:routerId", validateToken, varifyRouter, getSalesByRouter);

router.get("/user/sales", validateToken, totalSalesByUser);

export default router;