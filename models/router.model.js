import mongoose from "mongoose";
import { generateDefaultProfiles } from "../utils/profileUtils.js";


const routerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
    dns: { type: String, required: true, trim: true },
    port: { type: Number, required: true},
    userName: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    callerId: { type: String, enum: ["", "bind"], default: "", },
    profiles: { type: Map, of:Number, default: generateDefaultProfiles },
    deviceName: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Router", routerSchema);
