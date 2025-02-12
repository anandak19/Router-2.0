import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    userType: { type: String, required: true, enum: ["admin", "client"] },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      trim: true,
    },
    password: { type: String, required: true },
    totalSales: { type: Number, default: 0, min: 0 },
    totalCollectedCash: { type: Number, default: 0, min: 0 },
    balanceLeft: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
