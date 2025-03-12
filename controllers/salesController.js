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
  const routerId = req.router._id;
  const {
    period,
    startDate: startDateQuery,
    endDate: endDateQuery,
    user: selectedUserId,
  } = req.query;

  let startDate, endDate;

  try {
    const now = new Date();
    let selectedPeriod = "All";

    // if custome date range is provided
    if (startDateQuery && endDateQuery) {
      selectedPeriod = "custom";
      startDate = new Date(startDateQuery);
      endDate = new Date(endDateQuery);
      endDate.setUTCHours(23, 59, 59, 999);
    } else if (period) {
      // if no custom date is prodvided
      switch (period) {
        case "day":
          selectedPeriod = "today";
          startDate = new Date();
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "week":
          selectedPeriod = "This week";
          startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date(now.setDate(now.getDate() + (6 - now.getDay()))); // End of the week (Saturday)
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        case "thisMonth":
          selectedPeriod = "This month";
          startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the current month
          endDate.setUTCHours(23, 59, 59, 999); // End of the last day of the month
          break;

        case "lastMonth":
          selectedPeriod = "Last month";
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          endDate.setUTCHours(23, 59, 59, 999);
          break;

        default:
          return res
            .status(400)
            .json({ error: "Invalid period parameter or missing date range" });
      }
    }

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
      period: selectedPeriod,
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
