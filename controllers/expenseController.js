import { STATUS_CODES } from "../constants/statusCodes.js";
import expenseModel from "../models/expense.model.js";
import routerModel from "../models/router.model.js";
import { CustomError } from "../utils/customError.js";

export const addNewExpense = async (req, res, next) => {
  try {
    console.log("got here");
    const {
      date,
      expenseCategory,
      routerIds,
      isSelectAll,
      isSplit,
      isApplyIndividually,
      amount,
      description,
      invoiceNumber,
      person,
      profession,
    } = req.expenseData;
    let splitAmount = 0;

    //if split is true but , isSelectetAll is also true
    if (isSelectAll && isSplit) {
      const totalRouters = await routerModel.countDocuments();
      splitAmount = amount / totalRouters;
    }

    //if split is true, divide the amount by the number of routers and assign it to the split amout
    if (isSplit && routerIds && routerIds.length > 0 && !isSelectAll) {
      splitAmount = amount / routerIds.length;
    }

    const newExpense = new expenseModel({
      date,
      expenseCategory,
      routerIds,
      isSelectAll,
      isSplit,
      isApplyIndividually,
      amount,
      splitAmount,
      description,
      invoiceNumber,
      person,
      profession,
    });

    const savedExpense = await newExpense.save();
    if (!savedExpense) {
      throw new CustomError(
        "Faild to save new expense",
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }

    res
      .status(STATUS_CODES.CREATED)
      .json({ message: "Expense added successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAllExpense = async (req, res, next) => {
  // logic to get all expense
  try {
    const startDate = req.startDate;
    const endDate = req.endDate;
    const selectedPeriod = req.period;

    const { routerId } = req.query;

    let matchStage = {};

    if (startDate && endDate) {
      matchStage.date = { $gte: startDate, $lte: endDate };
    }

    if (routerId) {
      console.log("Router id is present");
      const router = await routerModel.findById(routerId);
      if (!router) {
        throw new CustomError(
          "Selected router not found",
          STATUS_CODES.NOT_FOUND
        );
      }
      matchStage.$or = [{ routerIds: router._id }, { isSelectAll: true }];
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "routers",
          localField: "routerIds",
          foreignField: "_id",
          as: "routers",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const expenses = await expenseModel.aggregate(pipeline);

    res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Expenses fetched successfully", expenses });
  } catch (error) {
    next(error);
  }
};

export const saveEditedExpense = (req, res, next) => {
  // logic to save edited expense back to db
};

export const deleteSelectedExpense = (req, res, next) => {
  // logic to delete selected expense from db
};
