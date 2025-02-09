import routerModel from "../models/router.model.js";
import userModel from "../models/user.model.js";
import userRouterModel from "../models/userRouter.model.js";
import voucherModel from "../models/voucher.model.js";

export const addVoucher = async (req, res) => {
  try {
    const user = req.user;
    const router = req.router;
    const { couponNumber, profile, phoneNumber } = req.body;

    if (!user || !router) {
      return res
        .status(400)
        .json({ error: "Missing user or router information." });
    }

    // Check if the user has added this router
    const userRouter = await userRouterModel.findOne({
      userId: user._id,
      routerId: router._id,
    });
    if (!userRouter) {
      return res
        .status(403)
        .json({ error: "Access denied. You have not added this router yet." });
    }

    const existingVoucher = await voucherModel.findOne({ couponNumber, userId: user._id });
    if (existingVoucher) {
      return res.status(409).json({ error: "You have already added this voucher." });
    }

    // Validate profile existence in the router
    if (!router.profiles.has(profile)) {
      return res
        .status(404)
        .json({ error: `Profile '${profile}' not found in the router.` });
    }

    // Get the profile cost
    const cost = router.profiles.get(profile);

    // Create a new voucher
    const newVoucher = new voucherModel({
      couponNumber,
      profile,
      cost,
      phoneNumber,
      userId: user._id,
      routerId: router._id,
    });

    // Save the voucher to the database
    const voucherData = await newVoucher.save();

    return res.status(201).json({
      message: "Voucher added successfully.",
      voucher: voucherData,
    });
  } catch (error) {
    console.error("Error adding voucher:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};



