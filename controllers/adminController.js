import permissionModel from "../models/permission.model.js";
import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";

export const getAddedUsers = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const users = await permissionModel.aggregate([
      {
        $match: { viewer: userId },
      },
      {
        $lookup: {
          from: "users",
          localField: "canView",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $replaceRoot: { newRoot: "$userDetails" },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching added users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const grantViewPermission = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { userName } = req.body;

    if (!userName) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a username" });
    }

    const user = await userModel.findOne({ userName });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found, try another username",
      });
    }

    const newPermission = new permissionModel({
      viewer: userId,
      canView: user._id,
    });
    await newPermission.save();

    return res.status(200).json({ success: true, message: "User added to your list" });
  } catch (error) {
    console.error("Error granting view access:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const revokeViewPermission = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const selectedUserId = req.params.id;

    if (!selectedUserId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const selectedUser = await userModel.findById(selectedUserId)

    if (!selectedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const result = await permissionModel.deleteOne({
      viewer: userId,
      canView: selectedUser._id
    });

    if (result.deletedCount === 0) {
      return res
      .status(400)
      .json({ success: false, message: "Failed to remove user from your list" });
    }

    return res.status(200).json({ success: true, message: "User removed from your list" });

  } catch (error) {
    console.error("Error revoking view access:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


export const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.userType) {
      return res
        .status(400)
        .json({ error: "User type is missing in user data" });
    }

    user.userType = user.userType === "client" ? "admin" : "client";

    await user.save();

    res
      .status(200)
      .json({ message: `User role updated to ${user.userType} successfully` });
  } catch (error) {
    console.log(error);
    res.status(200).json({ error: "Internal server error" });
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
    console.log(router);
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
      return res.status(400).json({
        success: false,
        message: "Router already linked to this user",
      });
    }

    const newUserRouter = new userRouterModel({
      userId: user._id,
      routerId: router._id,
      hotspot: hotspot,
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
