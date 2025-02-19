import express from "express"
import { getAddedUsers, getUserDetails, linkRouterWithUser } from "../controllers/adminController.js";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { deductUserBalace } from "../controllers/accountsController.js";


const router = express.Router()

// list all the users added by admin  /admin/users
router.get("/users", validateToken, authenticateAdmin, getAddedUsers)

/// Admin selects a user to view their data → (API: GET /api/users/:userId
router.get("/users/:requestedUserId", validateToken, authenticateAdmin, getUserDetails) 

// Admin clicks "Add Router" and enters DNS + Port + username
// Server finds the existing router and links it with the user 
router.post("/users/:requestedUserId/add-router", validateToken, authenticateAdmin, linkRouterWithUser) 

//deduct balace from user
router.patch("/users/cash/collect", validateToken, authenticateAdmin, deductUserBalace)

export default router;