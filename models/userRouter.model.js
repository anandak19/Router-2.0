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
  },
  {
    timestamps: true,
  }
);

UserRoutersSchema.index({ userId: 1, routerId: 1 }, { unique: true });

export default mongoose.model("UserRouters", UserRoutersSchema);
