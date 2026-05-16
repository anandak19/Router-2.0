import mongoose from "mongoose";
import routerModel from "../models/router.model.js";
import userRouterModel from "../models/userRouter.model.js";

import { STATUS_CODES } from "../constants/statusCodes.js";
import { CustomError } from "../utils/customError.js";

// to add new router --
export const addRouter = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = req.user;
    const { dns, port, userName, password, hotspot, deviceName, callerId } =
      req.body;

    let router = await routerModel.findOne({ dns, port }).session(session);

    // if no exixting router, create one
    if (!router) {
      const newRouter = new routerModel({
        dns,
        port,
        userName,
        password,
        deviceName,
        callerId,
        userId: user._id,
      });
      router = await newRouter.save({ session });
    }

    const existingUserRouter = await userRouterModel
      .findOne({
        routerId: router._id,
        userId: user._id,
      })
      .session(session);

    if (existingUserRouter) {
      throw new CustomError(
        "Router already linked to user.",
        STATUS_CODES.CONFLICT
      );
    }

    await userRouterModel.create(
      [{ userId: user._id, routerId: router._id, hotspot }],
      { session }
    );

    await session.commitTransaction();

    return res
      .status(STATUS_CODES.CREATED)
      .json({ message: "Router added successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// to get all routers of a user --
export const getUserRouters = async (req, res, next) => {
  try {
    const user = req.user;
    const routers = await userRouterModel.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $lookup: {
          from: "routers",
          localField: "routerId",
          foreignField: "_id",
          as: "routerDetails",
        },
      },
      {
        $unwind: "$routerDetails",
      },
      {
        $addFields: {
          "routerDetails.hotspot": "$hotspot",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          router: "$routerDetails",
        },
      },
    ]);

    return res.status(STATUS_CODES.SUCCESS).json(routers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get total cash data / total sales on selected router on user-router collection
 */
export const getOneUserRouterCash = async (req, res, next) => {
  try {
    const user = req.user;
    const router = req.router;

    const [routerData] = await userRouterModel.aggregate([
      {
        $match: { userId: user._id, routerId: router._id },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          hotspot: 1,
          totalSalesByUserInRouter: 1,
          totalCollectedCash: 1,
          balanceLeftInRouter: 1,
        },
      },
    ]);

    if (!routerData) {
      throw new CustomError("Router data not found.", STATUS_CODES.NOT_FOUND);
    }

    return res.status(STATUS_CODES.SUCCESS).json(routerData);
  } catch (error) {
    next(error);
  }
};

// delete a router is not created
