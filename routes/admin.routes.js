import express from "express";
import {
  changeUserRole,
  getAddedUsers,
  getUserDetails,
  grantViewPermission,
  linkRouterWithUser,
  revokeViewPermission,
} from "../controllers/adminController.js";
import { authenticateAdmin, validateToken } from "../middlewares/auth.js";
import { deductUserBalace } from "../controllers/accountsController.js";
import { validateObjectId } from "../middlewares/requestValidations.js";

const router = express.Router();

//---APP & WEB BASED ROUTES---
/**
 * Get all users added by logged in admin /admin/users
 * OR Get all users whome admin has view permission
 * - Returns all user details with no pagination
 */
router.get("/users", validateToken, authenticateAdmin, getAddedUsers);

/**
 * Grand/Create view persmission
 * - link current admin with a clint using client userName
 */
router.post(
  "/users/permission/grant",
  validateToken,
  authenticateAdmin,
  grantViewPermission,
);

/**
 * Remove/Revoke a user from the view permission list of current admin
 */
router.delete(
  "/users/permission/revoke/:id",
  validateToken,
  authenticateAdmin,
  validateObjectId,
  revokeViewPermission,
);

// change selected user role to admin/clint
router.patch(
  "/users/:id/role",
  validateToken,
  authenticateAdmin,
  validateObjectId,
  changeUserRole,
);

/**
 * Get complete details of a selected user
 * - user details only and not sales & routers
 */
router.get(
  "/users/:requestedUserId",
  validateToken,
  authenticateAdmin,
  validateObjectId,
  getUserDetails,
);

/**
 * Link a user with router (Add a router under selcted user)
 * - dns, port, username and hotspot will be in the request
 * - server find the correct router and link it with the user (create userRouter with empty cash data)
 */
router.post(
  "/users/:requestedUserId/add-router",
  validateToken,
  authenticateAdmin,
  validateObjectId,
  linkRouterWithUser,
);

/**
 * Deduct balance from selected user
 * - in request: amount, comment(optional), userId
 * - collection flow: collect first from user collected section and then from sales
 */
router.patch(
  "/users/cash/collect",
  validateToken,
  authenticateAdmin,
  deductUserBalace,
);

//send cash to clint. ---WHYATTT?
router.patch(
  "/users/cash/send",
  validateToken,
  authenticateAdmin,
  deductUserBalace,
);

export default router;
