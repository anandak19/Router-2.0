import express from "express"
import { getAddedUsers, getUserDetails, linkRouterWithUser } from "../controllers/adminController.js";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";


const router = express.Router()

// list all the users added by admin  /admin/users
router.get("/users", validateToken, authenticateAdmin, getAddedUsers)

/// Admin selects a user to view their data → (API: GET /api/users/:userId
router.get("/users/:requestedUserId", validateToken, authenticateAdmin, getUserDetails) 

// Admin clicks "Add Router" and enters DNS + Port + username
// Server finds the existing router and links it with the user 
router.post("/users/:requestedUserId/add-router", validateToken, authenticateAdmin, linkRouterWithUser) 

export default router;