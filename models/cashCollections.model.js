import mongoose from "mongoose";

const { Schema } = mongoose;

const CashCollectionSchema = new Schema(
  {
    collectedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    comment: { type: String, default: "", trim: true },
    breakdown: {
      type: [
        {
          router: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Router",
            required: true,
          },
          amount: { type: Number, required: true, min: 0 },
        },
      ],
      default: null
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CashCollection", CashCollectionSchema);
