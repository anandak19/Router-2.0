import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import cashCollectionsModel from "../models/cashCollections.model.js";

export const deductUserBalace = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
  try {
    const { amount, comment, userId } = req.body;

    const requestedAmount = parseInt(amount)

    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ error: "Enter a valid amount to collect" });
    }

    if (!userId) {
      return res.status(400).json({ error: "Choose a user to collect cash from" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balanceLeft < requestedAmount) {
      return res
        .status(400)
        .json({ error: "Insufficient balace for user! Enter a valid amount" });
    }

    const userRouters = await userRouterModel
      .find({ userId: userId, balanceLeftInRouter: { $gt: 0 } })
      .sort({ balanceLeftInRouter: 1 }).session(session)

      if (!userRouters) {
        return res.status(400).json({ error: "No routers found for user with balace" });
      }

      let remainingAmount = requestedAmount
      const transactionBreakdown = [];

      for(const router of userRouters) {
        if (remainingAmount <= 0) break;

        const amountToDeduct = Math.min(router.balanceLeftInRouter, remainingAmount);
        router.balanceLeftInRouter -= amountToDeduct;
        router.totalCollectedCash += amountToDeduct
        remainingAmount -= amountToDeduct;

        transactionBreakdown.push({
            router: router._id,
            amount: amountToDeduct,
        });

        await router.save({ session });
      }
    //   still cash left to collect 
    if (remainingAmount > 0) {
        return res.status(400).json({ error: "Insufficient balance across routers to collect the full amount" });
    }

    const cashCollector = req.user
    if (!cashCollector) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Cash collector details are missing" });
    }

    user.balanceLeft -= requestedAmount
    user.totalCollectedCash += requestedAmount
    cashCollector.userCollectedCash += requestedAmount
    cashCollector.balanceLeft += requestedAmount
    await user.save({ session });
    await cashCollector.save({ session })


    const newCashCollection = new cashCollectionsModel({
        collectedFrom : user._id,
        collectedBy: cashCollector._id,
        amount: requestedAmount,
        comment: comment || '',
        breakdown: transactionBreakdown
    })


    await newCashCollection.save({session})


    await session.commitTransaction();
    console.log('Cash collected successfully');
    res.status(200).json({ messge: 'Cash collected successfully' })
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({error: 'Internal server error'})
  } finally {
    session.endSession();
  }
};
