import express from "express"
import { validateNewExpenseData } from "../middlewares/expenseValidations.js"
import { addNewExpense, getAllExpense } from "../controllers/expenseController.js"
import { getStartDateEndDate } from "../middlewares/helpers.js"
import { validateObjectId } from "../middlewares/requestValidations.js"

const router = express.Router()

router.get('/', validateObjectId, getStartDateEndDate, getAllExpense)

router.post('/add-expense', validateNewExpenseData, addNewExpense) 

export default router 