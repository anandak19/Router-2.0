import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import voucherModel from "../models/voucher.model.js";

export const getUserSales = async (userId) => {
  console.log(typeof userId)
  const pipeline = [
    {
      $match: {
        userId,
      },
    },
    {
      $lookup: {
        from: "routers",
        localField: "routerId",
        foreignField: "_id",
        as: "routerDetails",
      },
    },
    {
      $unwind: {
        path: "$routerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const userRouters = await userRouterModel.aggregate(pipeline);
  console.log(userRouters)
  return userRouters || null;
};
