import express from "express";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import {
  validateNewRouterData,
  validateNewVocherData,
  varifyRouter,
} from "../middlewares/routerValidations.js";
import { addRouter, getOneUserRouterCash, getUserRouters } from "../controllers/routerController.js";
import {
  addVoucher,
  getVouchersByRouter,
} from "../controllers/voucherController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";

const router = express.Router();

/**
 * Returns all routers under logged in user
 */
router.get("/", validateToken, getUserRouters);

/**
 * Returns Cash details on selected router
 * Cash of user router (Total cash data of a user on a router)
 */
router.get("/:routerId/cash", validateToken, validateObjectId, varifyRouter, getOneUserRouterCash);

/**
 * To add a new router
 * Admin only
 */
router.post(
  "/add-router",
  validateToken,
  authenticateAdmin,
  validateNewRouterData,
  addRouter
);
// router.delete("/:routerId", deleteOneRouter)

/**
 * To add a voucher under selected router
 */
router.post(
  "/voucher/:routerId",
  validateToken,
  validateObjectId,
  varifyRouter,
  validateNewVocherData,
  addVoucher
);
// router.delete('/delete-voucher/:routerId/:voucherId', deleteVoucherFromRouter);

/**
 * Get all vouchers under selected router
 */
router.get(
  "/voucher/:routerId",
  validateToken,
  validateObjectId,
  varifyRouter,
  getVouchersByRouter
);

export default router;
