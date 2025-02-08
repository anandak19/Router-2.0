import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    profile: { type: String, required: true, trim: true },
    count: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
    routerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Routers" },
  },
  { timestamps: true }
);

export default mongoose.model('Voucher', voucherSchema);