import express from "express";
import { validateNewExpenseData } from "../middlewares/expenseValidations.js";
import {
  addNewExpense,
  getAllExpense,
} from "../controllers/expenseController.js";
import { getStartDateEndDate } from "../middlewares/helpers.js";
import { validateObjectId } from "../middlewares/requestValidations.js";
import { validateToken } from "../middlewares/auth.js";

const router = express.Router();

/**
 * Get all expense in the system
 * - can filter by period / start & end date
 */
router.get(
  "/",
  validateToken,
  validateObjectId,
  getStartDateEndDate,
  getAllExpense,
);

/**
 * Add new expense entry
 */
router.post(
  "/add-expense",
  validateToken,
  validateNewExpenseData,
  addNewExpense,
);

export default router;
