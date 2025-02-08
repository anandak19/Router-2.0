import express from "express"
import { addRouter } from "../controllers/routerController.js";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { validateNewRouterData } from "../middlewares/routerValidations.js";
import { addRouter, deleteOneRouter, getUserRouters } from "../controllers/routerController.js"
// import { addVoucherData, deleteVoucherFromRouter } from "../controllers/voucherController.js"

const router = express.Router()

router.get("/router", validateToken, getUserRouters)
router.post("/router/add-router", validateToken, authenticateAdmin, validateNewRouterData, addRouter)
// router.delete("/router/:routerId", deleteOneRouter)
// router.patch("/router/voucher/:routerId", addVoucherData)
// router.delete('/router/delete-voucher/:routerId/:voucherId', deleteVoucherFromRouter);

export default router;