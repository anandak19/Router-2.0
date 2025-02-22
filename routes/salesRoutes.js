import express from "express"
import { validateToken } from "../middlewares/auth.js";
import { varifyRouter } from "../middlewares/routerValidations.js";
import { getSalesByRouter, salesOfGivenUser, totalSalesByUser } from "../controllers/salesController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";

const router = express.Router()


// get the vouchers under the router 
router.get("/router/:routerId", validateToken, validateObjectId, varifyRouter, getSalesByRouter);

router.get("/user", validateToken, totalSalesByUser);
router.get("/user/:id", validateToken, validateObjectId, salesOfGivenUser);

export default router;