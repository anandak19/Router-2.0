import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validateInput } from "../utils/validateInputs.js";
import { STATUS_CODES } from "../constants/statusCodes.js";
import { CustomError } from "../utils/customError.js";
dotenv.config();

export const authenticateAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.userType !== "admin") {
      throw new CustomError("Access Denied", STATUS_CODES.UNAUTHORIZED);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateInputs = async (req, res, next) => {
  try {
    const { email, phoneNumber, userName, password } = req.body;

    if (!email || !phoneNumber || !userName || !password) {
      throw new CustomError(
        "All fields are required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (!validateInput.validateEmail(email)) {
      throw new CustomError("Invalid email format", STATUS_CODES.BAD_REQUEST);
    }

    if (!validateInput.validatePhoneNumber(phoneNumber)) {
      throw new CustomError(
        "Invalid phone number format",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (!validateInput.validateUserName(userName)) {
      throw new CustomError(
        "Invalid username format",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (!validateInput.validatePassword(password)) {
      throw new CustomError(
        "Password must be 5+ characters with uppercase, lowercase, and a number",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * For Token validation (Authorization)
 * - Both web request and app request use this same method
 * - After varification user object is attached to request.user
 */
export const validateToken = async (req, res, next) => {
  try {
    // Try from cookies
    let token = req.cookies?.token;

    // If not in cookies, try Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new CustomError(
          "Token not found in cookies or authorization header",
          STATUS_CODES.BAD_REQUEST,
        );
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new CustomError("Invalid token format", STATUS_CODES.BAD_REQUEST);
      }

      token = parts[1];
    }

    // Verify the token with jwt
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      throw new CustomError(
        `Error in authentication: ${error.message}`,
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Check if user exists
    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new CustomError("Access denied!", STATUS_CODES.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
