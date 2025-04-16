import permissionModel from "../models/permission.model.js";
import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";

import { STATUS_CODES } from "../constants/statusCodes.js";
import { CustomError } from "../utils/customError.js";

export const getAddedUsers = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;

    const users = await permissionModel.aggregate([
      {
        $match: { viewer: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "canView",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $replaceRoot: { newRoot: "$userDetails" },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(STATUS_CODES.SUCCESS).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const grantViewPermission = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { userName } = req.body;

    if (!userName) {
      throw new CustomError(
        "Please provide a username",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const user = await userModel.findOne({ userName });
    if (!user) {
      throw new CustomError(
        "User not found, try another username",
        STATUS_CODES.NOT_FOUND
      );
    }

    const existingPermission = await permissionModel.findOne({viewer: userId, canView: user._id,})
    if(existingPermission) {
      throw new CustomError( "User is already added to your list", STATUS_CODES.CONFLICT)
    }

    const newPermission = new permissionModel({
      viewer: userId,
      canView: user._id,
    });
    await newPermission.save();

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ success: true, message: "User added to your list" });
  } catch (error) {
    next(error);
  }
};

export const revokeViewPermission = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const selectedUserId = req.params.id;

    if (!selectedUserId) {
      throw new CustomError("User ID is required", STATUS_CODES.BAD_REQUEST);
    }

    const selectedUser = await userModel.findById(selectedUserId);

    if (!selectedUser) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    const result = await permissionModel.deleteOne({
      viewer: userId,
      canView: selectedUser._id,
    });

    if (result.deletedCount === 0) {
      throw new CustomError(
        "Already deleted from list",
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ success: true, message: "User removed from your list" });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw new CustomError("User ID is required", STATUS_CODES.BAD_REQUEST);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (!user.userType) {
      throw new CustomError(
        "User type is missing in user data",
        STATUS_CODES.BAD_REQUEST
      );
    }

    user.userType = user.userType === "client" ? "admin" : "client";

    await user.save();

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: `User role updated to ${user.userType} successfully` });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const { requestedUserId } = req.params;

    if (!requestedUserId) {
      throw new CustomError("User ID is required", STATUS_CODES.BAD_REQUEST);
    }

    const user = await userModel.findById(requestedUserId);

    if (!user) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    return res.status(STATUS_CODES.SUCCESS).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// add/link routers with user
export const linkRouterWithUser = async (req, res, next) => {
  try {
    const { requestedUserId } = req.params;
    const { dns, port, username, hotspot } = req.body;

    if (!requestedUserId || !dns || !port || !username || !hotspot) {
      throw new CustomError(
        "Missing required fields",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const user = await userModel.findById(requestedUserId);
    if (!user) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    const router = await routerModel.findOne({ dns, port, userName: username });
    if (!router) {
      throw new CustomError("Router not found", STATUS_CODES.NOT_FOUND);
    }

    const existingLink = await userRouterModel.findOne({
      userId: user._id,
      routerId: router._id,
    });
    if (existingLink) {
      throw new CustomError(
        "Router already linked to this user",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const newUserRouter = new userRouterModel({
      userId: user._id,
      routerId: router._id,
      hotspot: hotspot,
    });

    await newUserRouter.save();

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ success: true, message: "Router linked to user successfully" });
  } catch (error) {
    next(error)
  }
};
