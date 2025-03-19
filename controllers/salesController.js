import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import voucherModel from "../models/voucher.model.js";

import { getUserSales } from "../utils/userSales.js";

/*
period params 
startDate, endDate eg: ?startDate=2024-02-01&endDate=2024-02-10
day, week, thisMonth, lastMonth  eg: ?period=day
sales of selected user, url will look like this:    ?user=67bcc5e0d1ba233a6c879f91

returns: totalVouchers and totalSales in amount
*/

// show vouchers sales under the requested router
export const getSalesByRouter = async (req, res) => {
  try {
    const routerId = req.router._id;
    const startDate = req.startDate;
    const endDate = req.endDate;
    const period = req.period;
    const { user: selectedUserId } = req.query;

    const matchStage = { routerId: routerId };

    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (selectedUserId) {
      const user = await userModel.findById(selectedUserId);
      if (!user) {
        return res.status(404).json({ error: "Selected user was not found" });
      }
      matchStage.userId = user._id;
    }

    //   pipeline for total Cost
    const totalCostPipeline = [
      { $match: matchStage },
      {
        $facet: {
          totalSales: [
            {
              $group: {
                _id: null,
                totalSalesAmount: { $sum: "$cost" },
              },
            },
          ],
          totalVouchers: [
            {
              $count: "totalVouchers",
            },
          ],
          countBrakedown: [
            {
              $group: {
                _id: "$profile",
                count: { $sum: 1 },
                subTotalSales: { $sum: "$cost" },
              },
            },
            {
              $addFields: { profile: "$_id" },
            },
            {
              $project: { _id: 0 },
            },
          ],
        },
      },
    ];

    // pipline for profile wise count

    const salesData = await voucherModel.aggregate(totalCostPipeline);

    const totalSales =
      salesData[0].totalSales.length > 0
        ? salesData[0].totalSales[0].totalSalesAmount
        : 0;

    const totalVouchers =
      salesData[0].totalVouchers.length > 0
        ? salesData[0].totalVouchers[0].totalVouchers
        : 0;

    const countBrakedown =
      salesData[0].countBrakedown.length > 0 ? salesData[0].countBrakedown : [];

    return res.status(200).json({
      message: "Sales data fetched successfully.",
      routerId,
      period,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      totalSales,
      totalVouchers,
      countBrakedown,
    });
  } catch (error) {
    console.error("Error adding voucher:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getVoucherHistory = async (req, res) => {
  try {
    const routerId = req.router._id;
    const startDate = req.startDate;
    const endDate = req.endDate;
    const period = req.period;
    const { user: selectedUserId } = req.query;

    const matchStage = { routerId: routerId };

    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    if (selectedUserId) {
      const user = await userModel.findById(selectedUserId);
      if (!user) {
        return res.status(404).json({ error: "Selected user was not found" });
      }
      matchStage.userId = user._id;
    }

    const voucherHistoryPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "addedUser",
        },
      },
      {
        $unwind: "$addedUser",
      },
      {
        $project: {
          couponNumber: 1,
          profile: 1,
          count: 1,
          cost: 1,
          phoneNumber: 1,
          createdAt: 1,
          "addedUser.userName": 1,
          "addedUser.phoneNumber": 1,
          "addedUser.email": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const voucherHistory = await voucherModel.aggregate(voucherHistoryPipeline);

    return res.status(200).json({
      message: "Voucher history fetched successfully",
      period,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      voucherHistory,
    });
  } catch (error) {
    console.error("Error adding voucher:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// total sales of login in user, in each router and total -- for login users
export const totalSalesByUser = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!user._id) {
      return res.status(400).json({ message: "User ID is missing or invalid" });
    }

    const salesData = await getUserSales(user._id);
    if (!salesData) {
      return res
        .status(404)
        .json({ message: "No sales data found for this user" });
    }

    res.status(200).json({
      message: "Sales data retrieved successfully",
      routerSales: salesData,
      totalBalance: user.balanceLeft,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// total sales of given user , in each router and total
export const salesOfGivenUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salesData = await getUserSales(user._id);

    if (!salesData) {
      return res
        .status(404)
        .json({ message: "No sales data found for this user" });
    }

    res.status(200).json({
      message: "User sales data retrieved successfully",
      currentBalance: user.balanceLeft,
      routerSales: salesData,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
