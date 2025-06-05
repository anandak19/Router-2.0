import express from "express"
import { changeUserRole, getAddedUsers, getUserDetails, grantViewPermission, linkRouterWithUser, revokeViewPermission } from "../controllers/adminController.js";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { deductUserBalace } from "../controllers/accountsController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";


const router = express.Router()

// list all the users added by admin  /admin/users
router.get("/users", validateToken, authenticateAdmin, getAddedUsers)

// grandt view permission (link admin with clint)
router.post("/users/permission/grant", validateToken, authenticateAdmin, grantViewPermission)

// revoke or remove a user from the view permission list
router.delete("/users/permission/revoke/:id", validateToken, authenticateAdmin, validateObjectId, revokeViewPermission)

// change selected user role to admin/clint
router.patch("/users/:id/role", validateToken, authenticateAdmin, validateObjectId, changeUserRole)

/// Admin selects a user to view their data 
router.get("/users/:requestedUserId", validateToken, authenticateAdmin, validateObjectId, getUserDetails)

// Admin clicks "Add Router" and enters DNS + Port + username
// Server finds the existing router and links it with the user
router.post("/users/:requestedUserId/add-router", validateToken, authenticateAdmin, validateObjectId, linkRouterWithUser) 

//deduct balace from user
router.patch("/users/cash/collect", validateToken, authenticateAdmin, deductUserBalace)

//send cash to clint
router.patch("/users/cash/send", validateToken, authenticateAdmin, deductUserBalace)

export default router;