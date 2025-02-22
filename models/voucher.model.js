import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    couponNumber: { type: String, default: "", trim: true },
    profile: { type: String, required: true, trim: true },
    count: {
      type: Number,
      default: 1,
    },
    cost: { type: Number, required: true, min: 0 },
    phoneNumber: { type: String, default: null, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    routerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Routers",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Voucher", voucherSchema);
