import { STATUS_CODES } from "../constants/statusCodes.js";
import userModel from "../models/user.model.js";
import { CustomError } from "../utils/customError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// login user
export const loginWebUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userData = await userModel.findOne({ email });
    if (!userData) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    // check password
    const isMatch = password === userData.password;
    if (!isMatch) {
      throw new CustomError("Invalid password", STATUS_CODES.BAD_REQUEST);
    }

    // create a token
    const userName = userData.userName;
    const userID = userData._id;
    const token = jwt.sign(
      { id: userData._id, userName },
      process.env.SECRET_KEY
    );

    // set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(STATUS_CODES.SUCCESS).json({
      userName,
      userID,
      userType: userData.userType,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutWebUser = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(STATUS_CODES.SUCCESS)
    .json({ message: "Logged out successfully" });
};

export const isLogin = (req, res) => {
  const user = req.user;

  res.status(STATUS_CODES.SUCCESS).json({
    isLoggedIn: true,
    userName: user.userName,
    userID: user._id,
    userType: user.userType,
  });
};
