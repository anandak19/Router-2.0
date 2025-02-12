import userModel from "../models/user.model.js";
import { validateInput } from "../utils/validateInputs.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const authenticateAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.userType !== "admin") {
      return res.status(403).json({ error: "Access Denied" });
    }

    next();
  } catch (error) {
    console.error("Error in authentication:", error);
    return { status: 500, response: { error: "Internal server error" } };
  }
};

export const validateInputs = async (req, res, next) => {
  const { email, phoneNumber, userName } = req.body;

  if (!validateInput.validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validateInput.validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  if (!validateInput.validateUserName(userName)) {
    return res.status(400).json({ error: "Invalid username format" });
  }

  next();
};

// for token validation 
export const validateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    // Verify the format is 'Bearer <token>'
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = parts[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return res.status(401).json({ error: `Error in authentication: ${error.message}` });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "Access denied!" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};