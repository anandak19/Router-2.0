import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import cashCollectionsModel from "../models/cashCollections.model.js";

import { CustomError } from "../utils/customError.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const deductUserBalace = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, comment, userId } = req.body;

    const requestedAmount = parseInt(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      throw new CustomError(
        "Enter a valid amount to collect",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (!userId) {
      throw new CustomError(
        "Choose a user to collect cash from",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (user.balanceLeft < requestedAmount) {
      throw new CustomError(
        "Insufficient balace for user! Enter a valid amount",
        STATUS_CODES.CONFLICT
      );
    }

    let remainingAmount = requestedAmount;

    // if the userCollectedCash has cash in it deduct from that first
    if (user.userCollectedCash > 0) {
      const amountToDeduct = Math.min(user.userCollectedCash, remainingAmount);
      user.userCollectedCash -= amountToDeduct;
      remainingAmount -= amountToDeduct;
    }

    const transactionBreakdown = [];
    // if still their is cash needed to reach the target amount, get it from routers
    if (remainingAmount > 0) {
      const userRouters = await userRouterModel
        .find({ userId: userId, balanceLeftInRouter: { $gt: 0 } })
        .sort({ balanceLeftInRouter: 1 })
        .session(session);

      if (!userRouters) {
        throw new CustomError(
          "No routers found for user with balace",
          STATUS_CODES.CONFLICT
        );
      }

      for (const router of userRouters) {
        if (remainingAmount <= 0) break;

        const amountToDeduct = Math.min(
          router.balanceLeftInRouter,
          remainingAmount
        );
        router.balanceLeftInRouter -= amountToDeduct;
        router.totalCollectedCash += amountToDeduct;
        remainingAmount -= amountToDeduct;

        transactionBreakdown.push({
          router: router._id,
          amount: amountToDeduct,
        });
        await router.save({ session });
      }
    }

    //   still cash left to collect
    if (remainingAmount > 0) {
      throw new CustomError( "Insufficient balance across routers to collect the full amount" , STATUS_CODES.BAD_REQUEST)
    }

    const cashCollector = req.user;
    if (!cashCollector) {
      throw new CustomError(  "Cash collector details are missing", STATUS_CODES.BAD_REQUEST)
    }

    user.balanceLeft -= requestedAmount;
    user.totalCollectedCash += requestedAmount;
    cashCollector.userCollectedCash += requestedAmount;
    cashCollector.balanceLeft += requestedAmount;
    await user.save({ session });
    await cashCollector.save({ session });

    const newCashCollection = new cashCollectionsModel({
      collectedFrom: user._id,
      collectedBy: cashCollector._id,
      amount: requestedAmount,
      comment: comment || "",
      breakdown: transactionBreakdown,
    });

    await newCashCollection.save({ session });

    await session.commitTransaction();
    res.status(STATUS_CODES.SUCCESS).json({ messge: "Cash collected successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(error)
  } finally {
    session.endSession();
  }
};
