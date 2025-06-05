import mongoose, { isObjectIdOrHexString } from "mongoose";
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
      throw new CustomError(
        "Insufficient balance across routers to collect the full amount",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const cashCollector = req.user;
    if (!cashCollector) {
      throw new CustomError(
        "Cash collector details are missing",
        STATUS_CODES.BAD_REQUEST
      );
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
    res
      .status(STATUS_CODES.SUCCESS)
      .json({ messge: "Cash collected successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// send cash to clint by admin
export const sendCash = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, userId } = req.body;

    const amountToSend = parseInt(amount);

    if (!amountToSend || amountToSend <= 0) {
      throw new CustomError(
        "Enter a valid amount to send",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (!userId) {
      throw new CustomError(
        "Choose a user to send cash",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    const sender = req.user;
    if (!sender) {
      throw new CustomError(
        "Cash sender details are missing",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (sender.balanceLeft < amountToSend) {
      throw new CustomError(
        "Insufficient balace! Enter a valid amount",
        STATUS_CODES.CONFLICT
      );
    }

    // deduct the amount from the admin balance and credit to clint/user
    // here balance in the router is an issue.

    // solution
    let remainingAmount = amountToSend;
    // if the userCollectedCash has cash in it deduct from that first
    if (sender.userCollectedCash > 0) {
      const amountToDeduct = Math.min(
        sender.userCollectedCash,
        remainingAmount
      );
      sender.userCollectedCash -= amountToDeduct;
      remainingAmount -= amountToDeduct;
    }

    // still cash left to withdrow. withdrow from routers 
    if (remainingAmount > 0) {
      const userRouters = await userRouterModel
        .find({ userId: sender._id, balanceLeftInRouter: { $gt: 0 } })
        .sort({ balanceLeftInRouter: 1 })
        .session(session);

      if (!userRouters) {
        throw new CustomError(
          "No routers found with balace",
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
        // insted of this we need a new feald named cashUsed. (cash send to isObjectIdOrHexString, cash deducted for expence )
        // router.totalCollectedCash += amountToDeduct;
        remainingAmount -= amountToDeduct;

        await router.save({ session });
      }
    }

    //   still cash left to collect
    if (remainingAmount > 0) {
      throw new CustomError(
        "Insufficient balance across routers to collect the full amount",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // deduct the balanceLeft from admin 
    // we need a new feald named cash used
    // add amount to balanceLeft of clint 

    // save both sender and clint with updated data 

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
