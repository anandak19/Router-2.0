import express from "express";
import {
  registerAdmin,
  loginUser,
  addClient,
  getLatestTransaction,
  getUserDetails,
} from "../controllers/userController.js";
import {
  authenticateAdmin,
  validateInputs,
  validateToken,
} from "../middlewares/auth.js";
import {
  isLogin,
  loginWebUser,
  logoutWebUser,
} from "../controllers/webUserController.js";

const router = express.Router();

//---APP BASED ROUTES---
/**
 * Create and Register new Admin to the system
 */
router.post("/register/admin", validateInputs, registerAdmin); // APP WEAK POINT, TODO: FIX IT

/**
 * Create and add new "client" - user to the system by Admin
 */
router.post(
  "/register",
  validateToken,
  authenticateAdmin,
  validateInputs,
  addClient,
);

/**
 * Login App based user
 */
router.post("/login", loginUser);

//---WEB BASED ROUTES---
/**
 * Login web based user
 */
router.post("/web/login", loginWebUser);

/**
 * Logout web based user
 */
router.post("/web/logout", logoutWebUser);
/**
 * Check if the user is loggedin
 */
router.get("/web/is-login", validateToken, isLogin);

//---APP & WEB BASED ROUTES---
/**
 * Get last cash collection (transaction) made on requested user
 * Requested user as collectedFrom (last collection done on me)
 */
router.get("/transactions/latest", validateToken, getLatestTransaction);

/**
 * Get user details of logged in user
 */
router.get("/user-details", validateToken, getUserDetails);

export default router;
