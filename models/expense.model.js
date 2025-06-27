import mongoose from "mongoose";
import counterModel from "./counter.model.js";

const expenseSchema = new mongoose.Schema(
  {
    slNo: { type: String, unique: true },
    expenseCategory: {type: String, required: true},
    date: { type: Date, required: true },
    routerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Router" }],
    isSelectAll: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    isSplit: { type: Boolean, required: true },
    splitAmount: { type: Number, default: 0 },
    isApplyIndividually: { type: Boolean, default: true },
    description: {type: String, default: ''},
    person: {type: String, default: ''},
    profession: {type: String, default: ''},
  },
  {
    timestamps: true
  }
);

expenseSchema.pre("validate", function (next) {
  if (this.isSplit && this.isApplyIndividually) {
    return next(new Error("Both 'split' and 'applyIndividually' cannot be true at the same time."));
  }

  if (!this.isSplit && !this.isApplyIndividually) {
    return next(new Error("Either 'split' or 'applyIndividually' must be true."));
  }

  if (this.isSplit && (!this.splitAmount || this.splitAmount <= 0)) {
    return next(new Error("'splitAmount' must be greater than 0 when 'split' is true."));
  }

  if (this.isSelectAll && this.routerIds && this.routerIds.length > 0) {
    return next(new Error("'routerIds' must be empty when 'selectAll' is true."));
  }

  next();
});

expenseSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await counterModel.findOneAndUpdate(
      { collectionName: "expense" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.slNo = String(counter.seq).padStart(6, "0");
  }

  next();
});

export default mongoose.model("Expense", expenseSchema);
