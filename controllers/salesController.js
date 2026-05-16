import userModel from "../models/user.model.js";
import voucherModel from "../models/voucher.model.js";

import { getUserSales } from "../utils/userSales.js";
import { STATUS_CODES } from "../constants/statusCodes.js";
import { CustomError } from "../utils/customError.js";

/*
period params 
startDate, endDate eg: ?startDate=2024-02-01&endDate=2024-02-10
day, week, thisMonth, lastMonth  eg: ?period=day
sales of selected user, url will look like this:    ?user=67bcc5e0d1ba233a6c879f91

returns: totalVouchers and totalSales in amount
*/

// show vouchers sales under the requested router
export const getSalesByRouter = async (req, res, next) => {
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
        throw new CustomError(
          "Selected user was not found",
          STATUS_CODES.NOT_FOUND
        );
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
                count: { $sum: "$count" },
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

    // total sales amount
    const totalSales =
      salesData[0].totalSales.length > 0
        ? salesData[0].totalSales[0].totalSalesAmount
        : 0;

    // total vouchers count
    const totalVouchers =
      salesData[0].totalVouchers.length > 0
        ? salesData[0].totalVouchers[0].totalVouchers
        : 0;

    // count break down by profile
    const countBrakedown =
      salesData[0].countBrakedown.length > 0 ? salesData[0].countBrakedown : [];

    return res.status(STATUS_CODES.SUCCESS).json({
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
    next(error);
  }
};

export const getVoucherHistory = async (req, res, next) => {
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
        throw new CustomError(
          "Selected user was not found",
          STATUS_CODES.NOT_FOUND
        );
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

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Voucher history fetched successfully",
      period,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      voucherHistory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Total sales of loggedin user in each routers (userRouters)
 * - returns each router data with all details and total balance 
 */
export const totalSalesByUser = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new CustomError(
        "User not authenticated",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    if (!user._id) {
      throw new CustomError(
        "User ID is missing or invalid",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // router sales (user routers with all details)
    const salesData = await getUserSales(user._id);
    if (!salesData) {
      throw new CustomError(
        "No sales data found for this user",
        STATUS_CODES.NOT_FOUND
      );
    }

    res.status(STATUS_CODES.SUCCESS).json({
      message: "Sales data retrieved successfully",
      routerSales: salesData,
      totalBalance: user.balanceLeft,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns total sales of given user , in all routers (total voucher sales)
 * - Sum down the cost of all vouchers into one and count's into one
 * - Returns total cost and total count
 */
export const salesOfGivenUser = async (req, res, next) => {
  try {
    const startDate = req.startDate;
    const endDate = req.endDate;
    const period = req.period;

    const userId = req.params.id;

    if (!userId) {
      throw new CustomError("User ID is required", STATUS_CODES.BAD_REQUEST);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new CustomError("User not found", STATUS_CODES.NOT_FOUND);
    }

    const matchStage = { userId: user._id };

    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const userSalesPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSale: { $sum: "$cost" },
          totalVouchers: { $sum: "$count" },
        },
      },
      {
        $project: {
          _id: 0,
          totalSale: 1,
          totalVouchers: 1,
        },
      },
    ];

    const userSales = await voucherModel.aggregate(userSalesPipeline);

    res.status(STATUS_CODES.SUCCESS).json({
      message: "User sales data retrieved successfully",
      period,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      totalUserSales: userSales[0] || { totalSale: 0, totalVouchers: 0 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vouchers sales on router by logged in user
 * - returns vouchers with its cost only (like history) and not aggregated value
 * - TODO: Add router id to match stage to complete the method
 */
export const getVoucherSaleOnRouterByLoggedinUser = async (req, res, next) => {
  try {
    const { startDate, endDate, period } = req;
    const routerId = req.router._id; // TODO: use routerId in match stage to complete the method
    const user = req.user;

    if (!user || !user._id) {
      throw new CustomError(
        "Please Login to continue",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const matchStage = { userId: user._id };

    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          _id: 0,
          id: "$_id",
          couponNumber: 1,
          profile: 1,
          count: 1,
          cost: 1,
          phoneNumber: 1,
          date: {
            $dateToString: {
              format: "%d-%m-%Y",
              date: "$createdAt",
            },
          },
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];


    console.log('fetching')
    const userVouchers = await voucherModel.aggregate(pipeline);
    console.log(userVouchers)

    return res.status(STATUS_CODES.SUCCESS).json({
      period,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      vouchers: userVouchers,
    });
  } catch (error) {
    next(error);
  }
};
