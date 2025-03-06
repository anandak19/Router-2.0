import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canView: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Permission", permissionSchema);
