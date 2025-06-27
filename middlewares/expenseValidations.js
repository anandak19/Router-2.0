import { STATUS_CODES } from "../constants/statusCodes.js";
import { CustomError } from "../utils/customError.js";
import { validateRouterIds } from "../utils/validateRouterIds.js";

export const validateNewExpenseData = async (req, _res, next) => {
  try {
    const {
      date,
      expenseCategory,
      routerIds,
      isSelectAll,
      isSplit,
      isApplyIndividually,
      amount: rawAmount,
      // optional fields
      description,
      invoiceNumber,
      person,
      profession,
    } = req.body;

    const amount = Number(rawAmount);

    const isNullOrUndefined = (val) => val === null || val === undefined;

    if (!date) {
      throw new CustomError("Date is required", STATUS_CODES.BAD_REQUEST);
    }

    if (!expenseCategory) {
      throw new CustomError("Expense category is required", STATUS_CODES.BAD_REQUEST);
    }

    // await validateRouterIds(routerIds)

    if (isNullOrUndefined(isSelectAll)) {
      throw new CustomError(
        "Choose an option for selecting all camps",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (isNaN(amount) || amount <= 0) {
      throw new CustomError(
        "Provide a valid expense amount",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (isNullOrUndefined(isSplit)) {
      throw new CustomError(
        "Choose an option for split amount",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (isNullOrUndefined(isApplyIndividually)) {
      throw new CustomError(
        "Choose an option for amount applying individually",
        STATUS_CODES.BAD_REQUEST
      );
    }

    req.expenseData = {
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
    };

    next();
  } catch (error) {
    next(error);
  }
};
