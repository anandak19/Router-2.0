import express from "express"
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { validateNewRouterData, validateNewVocherData, varifyRouter } from "../middlewares/routerValidations.js";
import { addRouter, getUserRouters } from "../controllers/routerController.js"
import { addVoucher } from "../controllers/voucherController.js";

const router = express.Router()

router.get("/router", validateToken, getUserRouters)
router.post("/router/add-router", validateToken, authenticateAdmin, validateNewRouterData, addRouter)
// router.delete("/router/:routerId", deleteOneRouter)
router.post("/router/voucher/:routerId", validateToken, varifyRouter, validateNewVocherData, addVoucher)
// router.delete('/router/delete-voucher/:routerId/:voucherId', deleteVoucherFromRouter);

export default router;