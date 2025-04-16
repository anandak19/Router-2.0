import routerModel from "../models/router.model.js";
import mongoose from "mongoose";
import { CustomError } from "../utils/customError.js";
import { STATUS_CODES } from "../constants/statusCodes.js";

export const validateNewRouterData = (req, res, next) => {
  try {
    const { dns, port, userName, password, hotspot, deviceName } = req.body;

    if (!dns || !port || !userName || !password || !hotspot || !deviceName) {
      throw new CustomError( "All fields are required." , STATUS_CODES.BAD_REQUEST)
    }

    next();
  } catch (error) {
    next(error)
  }
};

export const varifyRouter = async (req, res, next) => {
  try {
    const { routerId } = req.params;

    if (!routerId) {
      throw new CustomError(  "Please provide router", STATUS_CODES.BAD_REQUEST)
    }

    if (!mongoose.Types.ObjectId.isValid(routerId)) {
      throw new CustomError( "Invalid router ID format. Must be a 24-character hex string." , STATUS_CODES.BAD_REQUEST)
    }

    const router = await routerModel.findById(routerId);
    if (!router) {
      throw new CustomError( "Router not found" , STATUS_CODES.NOT_FOUND)
    }

    req.router = router;
    next();

  } catch (error) {
    next(error)
  }
};

export const validateNewVocherData = (req, res, next) => {
  try {
    const { couponNumber, profile, phoneNumber } = req.body;
    const count = Number(req.body.count); 

    if (count && isNaN(count) && count <= 0) {
      throw new CustomError( "Count should be a positive number" , STATUS_CODES.BAD_REQUEST)
    }

    if (!count && !couponNumber) {
      throw new CustomError( "Coupon number is needed since no count is provided" , STATUS_CODES.BAD_REQUEST)
    }

    const profileRegex = /^(?:[1-9]|[12][0-9]|30)-D$/;
    if (
      !profile ||
      typeof profile !== "string" ||
      !profileRegex.test(profile)
    ) {
      throw new CustomError( "Invalid profile. It must be in the format 'X-D' where X is between 1 and 30." , STATUS_CODES.BAD_REQUEST)
    }

    if (phoneNumber) {
      const phoneRegex = /^\+?\d{7,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new CustomError( "Invalid phone number" , STATUS_CODES.BAD_REQUEST)
      }
    }

    next();
  } catch (error) {
    next(error)
  }
};