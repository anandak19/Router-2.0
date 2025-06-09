

export const addNewExpense = (req, res, next) => {
    // logic to add new expense
    console.log("Validatations passed, Data: ", req.body)
    res.json("Reached add expense")
}

export const getAllExpense = (req, res, next) =>{
    // logic to get all expense
}

export const saveEditedExpense = (req, res, next) => {
    // logic to save edited expense back to db
}

export const deleteSelectedExpense = (req, res, next) => {
    // logic to delete selected expense from db
}