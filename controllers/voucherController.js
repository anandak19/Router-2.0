import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import voucherModel from "../models/voucher.model.js";
import mongoose from "mongoose";

export const addVoucher = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = req.user;
    const router = req.router;
    const { couponNumber, profile, phoneNumber } = req.body;

    if (!user || !router) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ error: "Missing user or router information." });
    }

    // Check if the user has added this router
    const userRouter = await userRouterModel
      .findOne({
        userId: user._id,
        routerId: router._id,
      })
      .session(session);

    if (!userRouter) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ error: "Access denied. You have not added this router yet." });
    }

    const existingVoucher = await voucherModel
      .findOne({
        couponNumber,
        userId: user._id,
      })
      .session(session);

    if (existingVoucher) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({ error: "You have already added this voucher." });
    }

    // Validate profile existence in the router
    if (!router.profiles.has(profile)) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ error: `Profile '${profile}' not found in the router.` });
    }

    // Get the profile cost
    const cost = router.profiles.get(profile);

    // Create a new voucher
    const newVoucher = new voucherModel({
      couponNumber,
      profile,
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

    return res.status(201).json({
      message: "Voucher added successfully.",
      voucher: voucherData,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding voucher:", error);
    return res.status(500).json({ error: "Internal server error." });
  } finally {
    session.endSession();
  }
};

export const getVouchersByRouter = async (req, res) => {
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

    return res.status(200).json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
