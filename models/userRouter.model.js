import mongoose from "mongoose";

const { Schema } = mongoose;

const UserRoutersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    routerId: {
      type: Schema.Types.ObjectId,
      ref: "Routers",
      required: true,
      index: true,
    },
    totalSalesByUserInRouter: {type: Number, default: 0, min: 0 },
    totalCollectedCash: {type: Number, default: 0, min: 0 },
    balanceLeftInRouter: {type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

UserRoutersSchema.index({ userId: 1, routerId: 1 }, { unique: true });

export default mongoose.model("UserRouters", UserRoutersSchema);
