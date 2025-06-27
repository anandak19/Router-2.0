import express from "express"
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { validateNewRouterData, validateNewVocherData, varifyRouter } from "../middlewares/routerValidations.js";
import { addRouter, getUserRouters } from "../controllers/routerController.js"
import { addVoucher, getVouchersByRouter } from "../controllers/voucherController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";

const router = express.Router()

router.get("/", validateToken, getUserRouters)
router.post("/add-router", validateToken, authenticateAdmin, validateNewRouterData, addRouter)
// router.delete("/:routerId", deleteOneRouter)
router.post("/voucher/:routerId", validateToken, validateObjectId, varifyRouter, validateNewVocherData, addVoucher)
// router.delete('/delete-voucher/:routerId/:voucherId', deleteVoucherFromRouter);

router.get("/voucher/:routerId", validateToken, validateObjectId, varifyRouter, getVouchersByRouter)

export default router;