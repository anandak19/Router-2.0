import userRouterModel from "../models/userRouter.model.js";
import voucherModel from "../models/voucher.model.js";
import mongoose from "mongoose";
import { CustomError } from "../utils/customError.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const addVoucher = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    const router = req.router;
    const { couponNumber, profile, phoneNumber } = req.body;
    const count = Number(req.body.count) || 1;

    if (!user || !router) {
      throw new CustomError(
        "Missing user or router information.",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Check if the user has added this router
    const userRouter = await userRouterModel
      .findOne({
        userId: user._id,
        routerId: router._id,
      })
      .session(session);

    if (!userRouter) {
      throw new CustomError(
        "Access denied. You have not added this router yet.",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const existingVoucher = await voucherModel
      .findOne({
        couponNumber,
        userId: user._id,
      })
      .session(session);

    if (existingVoucher) {
      throw new CustomError(
        "You have already added this voucher.",
        STATUS_CODES.CONFLICT
      );
    }

    // Validate profile existence in the router
    if (!router.profiles.has(profile)) {
      throw new CustomError(
        `Profile '${profile}' not found in the router.`,
        STATUS_CODES.NOT_FOUND
      );
    }

    // Get the profile cost
    const profileCost = router.profiles.get(profile);
    const cost = profileCost * count;

    // Create a new voucher
    const newVoucher = new voucherModel({
      couponNumber,
      profile,
      count,
      cost,
      phoneNumber,
      userId: user._id,
      routerId: router._id,
    });

    // Save the voucher to the database
    const voucherData = await newVoucher.save({ session });

    // Update userRouter sales data
    userRouter.totalSalesByUserInRouter += voucherData.cost;
    userRouter.balanceLeftInRouter += voucherData.cost;

    // Update user sales data
    user.totalSales += voucherData.cost;
    user.balanceLeft += voucherData.cost;

    await userRouter.save({ session });
    await user.save({ session });

    await session.commitTransaction();

    return res.status(STATUS_CODES.CREATED).json({
      message: "Voucher added successfully.",
      voucher: voucherData,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getVouchersByRouter = async (req, res, next) => {
  try {
    const routerId = req.router._id;
    const {
      period,
      startDate: startDateQuery,
      endDate: endDateQuery,
    } = req.query;

    let startDate, endDate;

    const voucherPipeline = [];

    const now = new Date();
    // if custome date range is provided
    if (startDateQuery && endDateQuery) {
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);
      endDate.setUTCHours(23, 59, 59, 999);

      voucherPipeline.push({
        $match: {
          routerId: routerId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      });
    } else {
      voucherPipeline.push({
        $match: {
          routerId: routerId,
        },
      });
    }

    voucherPipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    });

    voucherPipeline.push({
      $unwind: {
        path: "$userDetails",
        preserveNullAndEmptyArrays: true,
      },
    });

    voucherPipeline.push({
      $project: {
        _id: 1,
        routerId: 1,
        profile: 1,
        cost: 1,
        createdAt: 1,
        couponNumber: 1,
        phoneNumber: 1,
        "user._id": "$userDetails._id",
        "user.name": "$userDetails.userName",
        "user.email": "$userDetails.email",
      },
    });

    voucherPipeline.push({
      $sort: { createdAt: -1 },
    });

    const vouchers = await voucherModel.aggregate(voucherPipeline);
    console.log("voch", vouchers);

    return res.status(STATUS_CODES.SUCCESS).json(vouchers);
  } catch (error) {
    next(error);
  }
};
