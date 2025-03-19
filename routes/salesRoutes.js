import express from "express"
import { validateToken } from "../middlewares/auth.js";
import { varifyRouter } from "../middlewares/routerValidations.js";
import { getSalesByRouter, getVoucherHistory, salesOfGivenUser, totalSalesByUser } from "../controllers/salesController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";
import { getStartDateEndDate } from "../middlewares/helpers.js";

const router = express.Router()


// get the vouchers under the router 
router.get("/router/:routerId", validateToken, validateObjectId, varifyRouter, getStartDateEndDate, getSalesByRouter);

// get vouchers history on router 
router.get("/router/:routerId/vouchers", validateToken, validateObjectId, varifyRouter, getStartDateEndDate, getVoucherHistory);
// for login users 
router.get("/user", validateToken, totalSalesByUser);
// to view selected users sales by admin 
router.get("/user/:id", validateToken, validateObjectId, salesOfGivenUser);

export default router;