import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";

export const getAddedUsers = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const users = await userModel
      .find({ addedBy: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching added users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { requestedUserId } = req.params;

    if (!requestedUserId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const user = await userModel.findById(requestedUserId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching users details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// add/link routers with user
export const linkRouterWithUser = async (req, res) => {
  try {
    const { requestedUserId } = req.params;
    const { dns, port, username, hotspot } = req.body;

    if (!requestedUserId || !dns || !port || !username || !hotspot) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const user = await userModel.findById(requestedUserId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const router = await routerModel.findOne({ dns, port, userName: username });
    console.log(router)
    if (!router) {
      return res
        .status(404)
        .json({ success: false, message: "Router not found" });
    }

    const existingLink = await userRouterModel.findOne({
      userId: user._id,
      routerId: router._id,
    });
    if (existingLink) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Router already linked to this user",
        });
    }

    const newUserRouter = new userRouterModel({
      userId: user._id,
      routerId: router._id,
      hotspot: hotspot
    });

    await newUserRouter.save();

    return res
      .status(200)
      .json({ success: true, message: "Router linked to user successfully" });
  } catch (error) {
    console.error("Error linking router to user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
