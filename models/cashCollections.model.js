import mongoose from "mongoose";

const { Schema } = mongoose;

const CashCollectionSchema = new Schema(
  {
    collectedFromUserId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    collectedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    comment: { type: String, default: null },
    collectedFromRouters: [
      {
        routerId: {
          type: Schema.Types.ObjectId,
          ref: "Routers",
          required: true,
        },
        collectedAmount: { type: Number, required: true, min: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CashCollection", CashCollectionSchema);
