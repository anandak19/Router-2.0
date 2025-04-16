import userRouterModel from "../models/userRouter.model.js";

export const getUserSales = async (userId) => {
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
  return userRouters || null;
};
