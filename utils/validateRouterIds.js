import mongoose from "mongoose";
import RouterModel from "../models/router.model.js";
import { CustomError } from "./customError.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const validateRouterIds = async (routerIds = []) => {
  if (!Array.isArray(routerIds) || routerIds.length === 0) {
    throw new CustomError("Router IDs must be a non-empty array", STATUS_CODES.BAD_REQUEST);
  }

  // Check if all are valid ObjectIds
  const invalidIds = routerIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds.length > 0) {
    throw new CustomError(`Invalid router ID(s): ${invalidIds.join(", ")}`, STATUS_CODES.BAD_REQUEST);
  }

  // Check if each ID exists in DB
  const existingRouters = await RouterModel.find({
    _id: { $in: routerIds },
  }).select("_id");
  const existingIds = existingRouters.map((router) => router._id.toString());

  const existingIdSet = new Set(existingIds);
  const missingIds = routerIds.filter((id) => !existingIdSet.has(id));

  if (missingIds.length > 0) {
    throw new CustomError(`Router ID(s) not found: ${missingIds.join(", ")}`, STATUS_CODES.BAD_REQUEST);
  }

  return true;
};
