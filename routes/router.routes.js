import express from "express";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import {
  validateNewRouterData,
  validateNewVocherData,
  varifyRouter,
} from "../middlewares/routerValidations.js";
import {
  addRouter,
  getOneUserRouterCash,
  getUserRouters,
} from "../controllers/routerController.js";
import {
  addVoucher,
  getVouchersByRouter,
} from "../controllers/voucherController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";

const router = express.Router();

//---APP & WEB BASED ROUTES---
/**
 * To create & add a new router to the system
 * - Admin only action
 */
router.post(
  "/add-router",
  validateToken,
  authenticateAdmin,
  validateNewRouterData,
  addRouter,
);
// router.delete("/:routerId", deleteOneRouter)

/**
 * Returns all routers under logged in user
 * - Router details only and not sales on it
 */
router.get("/", validateToken, getUserRouters);

/**
 * Returns Cash details on selected router
 * - Total cash data of a user on selected router
 */
router.get(
  "/:routerId/cash",
  validateToken,
  validateObjectId,
  varifyRouter,
  getOneUserRouterCash,
);

/**
 * To add a voucher under selected router
 */
router.post(
  "/voucher/:routerId",
  validateToken,
  validateObjectId,
  varifyRouter,
  validateNewVocherData,
  addVoucher,
);
// router.delete('/delete-voucher/:routerId/:voucherId', deleteVoucherFromRouter);

/**
 * Get all vouchers under selected router
 * - includes all vouchers added by all users
 * - supports filter by period and start & end date
 */
router.get(
  "/voucher/:routerId",
  validateToken,
  validateObjectId,
  varifyRouter,
  getVouchersByRouter,
);

export default router;
