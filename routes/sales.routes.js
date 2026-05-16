import express from "express";
import { validateToken } from "../middlewares/auth.js";
import { varifyRouter } from "../middlewares/routerValidations.js";
import {
  getSalesByRouter,
  getVoucherHistory,
  getVoucherSaleOnRouterByLoggedinUser,
  salesOfGivenUser,
  totalSalesByUser,
} from "../controllers/salesController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";
import { getStartDateEndDate } from "../middlewares/helpers.js";

const router = express.Router();

/**
 * Get ALL vouchers sales on selected router ( total aggregate sales, total vouchers, count break down ( profile, count, subTotalSales))
 * - can filter by period / start & end dates and by userId
 */
router.get(
  "/router/:routerId",
  validateToken,
  validateObjectId,
  varifyRouter,
  getStartDateEndDate,
  getSalesByRouter
);

/**
 * get ALL vouchers history on router
 * - can filter by period / start & end dates and by userId
 */
router.get(
  "/router/:routerId/vouchers",
  validateToken,
  validateObjectId,
  varifyRouter,
  getStartDateEndDate,
  getVoucherHistory
);

/**
 * Get vouchers sales on router by logged in user
 * - returns vouchers with its cost only (like history) and not aggregated value
 * - can filter by period / start & end dates
 */
router.get(
  "/user/router/:routerId/vouchers",
  validateToken,
  validateObjectId,
  varifyRouter,
  getStartDateEndDate,
  getVoucherSaleOnRouterByLoggedinUser
);

/**
 * Get total sales of loggedin user in each routers (userRouters)
 * - returns each router data with all details and total balance 
 */
router.get("/user", validateToken, totalSalesByUser);

/**
 * To get total sales of given user , in all routers (total voucher sales)
 * - Sum down the cost of all vouchers into one and count's into one
 * - Returns total cost and total count
 */
router.get(
  "/user/:id",
  validateToken,
  validateObjectId,
  getStartDateEndDate,
  salesOfGivenUser
);

export default router;
