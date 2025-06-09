import express from "express"
import { validateNewExpenseData } from "../middlewares/expenseValidations.js"
import { addNewExpense } from "../controllers/expenseController.js"

const router = express.Router()

router.post('/expense/add-expense', validateNewExpenseData, addNewExpense) 

export default router