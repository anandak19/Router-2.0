import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    couponNumber: { type: String, required: true, trim: true },
    profile: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
    phoneNumber: { type: String, default: null, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
    routerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Routers" },
  },
  { timestamps: true }
);

export default mongoose.model('Voucher', voucherSchema);