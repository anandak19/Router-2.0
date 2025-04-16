import mongoose from "mongoose";
import { CustomError } from "../utils/customError.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const validateObjectId = (req, res, next) => {
  try {
    const { id, requestedUserId, routerId } = req.params;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError("Invalid user ID format", STATUS_CODES.BAD_REQUEST);
    }

    if (requestedUserId && !mongoose.Types.ObjectId.isValid(requestedUserId)) {
      throw new CustomError(
        "Invalid requested user ID format",
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (routerId && !mongoose.Types.ObjectId.isValid(routerId)) {
      throw new CustomError(
        "Invalid requested router ID format",
        STATUS_CODES.BAD_REQUEST
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
