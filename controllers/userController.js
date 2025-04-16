import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userModel from "../models/user.model.js";
import permissionModel from "../models/permission.model.js";
import cashCollectionsModel from "../models/cashCollections.model.js";
import { CustomError } from "../utils/customError.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

dotenv.config();

// register new admin
export const registerAdmin = async (req, res, next) => {
  const { email, phoneNumber, userName, password } = req.body;

  try {
    const existingUser = await userModel.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    if (existingUser) {
      throw new CustomError("User already exists", STATUS_CODES.CONFLICT)
    }

    const newUser = new userModel({
      email,
      phoneNumber,
      userName,
      password,
      userType: "admin",
    });

    await newUser.save();
    res.status(STATUS_CODES.CREATED).json({ message: "User registered successfully" });
  } catch (error) {
    next(error)
  }
};

// login user
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userData = await userModel.findOne({ email });
    if (!userData) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND)
    }

    // check password
    const isMatch = password === userData.password;
    if (!isMatch) {
      throw new CustomError( "Invalid password", STATUS_CODES.BAD_REQUEST)
    }

    // create a token
    const userName = userData.userName;
    const userID = userData._id;
    const token = jwt.sign(
      { id: userData._id, userName },
      process.env.SECRET_KEY
    );

    // sending username and token to frontend
    res
      .status(STATUS_CODES.SUCCESS)
      .json({ userName, userID, token, userType: userData.userType });
  } catch (error) {
    next(error)
  }
};

// addClient by admin
export const addClient = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, phoneNumber, userName, password } = req.body;

    const existingUser = await userModel.findOne(
      { $or: [{ email }, { userName }] },
      null,
      { session }
    );

    if (existingUser) {
      throw new CustomError( "User already exists", STATUS_CODES.CONFLICT)
    }

    const newUser = new userModel({
      email,
      phoneNumber,
      userName,
      password,
      addedBy: req.user._id,
      userType: "client",
    });
    await newUser.save({ session });

    const newPermission = new permissionModel({
      viewer: req.user._id,
      canView: newUser._id,
    });
    await newPermission.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(STATUS_CODES.CREATED).json({ message: "Client user registered successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(error)
  } finally {
    session.endSession();
  }
};

export const getLatestTransaction = async (req, res,next) => {
  try {
    const user = req.user;
    if (!user || !user._id) {
      throw new CustomError( "User details not found", STATUS_CODES.NOT_FOUND)
    }

    const transactionsPipeline = [
      {
        $match: {
          collectedFrom: user._id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "collectedBy",
          foreignField: "_id",
          as: "collector",
        },
      },
      {
        $unwind: "$collector",
      },
      {
        $project: {
          _id: 0,
          collectorUsername: "$collector.userName",
          collectorEmail: "$collector.email",
          collectorPhone: "$collector.phoneNumber",
          amount: "$amount",
          comment: "$comment",
        },
      },
    ];

    const latestTransaction = await cashCollectionsModel.aggregate(
      transactionsPipeline
    );
    res.status(STATUS_CODES.SUCCESS).json(latestTransaction);
  } catch (error) {
    next(error)
  }
};
