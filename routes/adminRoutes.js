import express from "express"
import { changeUserRole, getAddedUsers, getUserDetails, linkRouterWithUser } from "../controllers/adminController.js";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { deductUserBalace } from "../controllers/accountsController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";


const router = express.Router()

// list all the users added by admin  /admin/users
router.get("/users", validateToken, authenticateAdmin, getAddedUsers)

// change selected user role to admin/clint
router.patch("/users/:id/role", validateToken, authenticateAdmin, validateObjectId, changeUserRole)

/// Admin selects a user to view their data 
router.get("/users/:requestedUserId", validateToken, authenticateAdmin, validateObjectId, getUserDetails) 

// Admin clicks "Add Router" and enters DNS + Port + username
// Server finds the existing router and links it with the user 
router.post("/users/:requestedUserId/add-router", validateToken, authenticateAdmin, validateObjectId, linkRouterWithUser) 

//deduct balace from user
router.patch("/users/cash/collect", validateToken, authenticateAdmin, deductUserBalace)

export default router;