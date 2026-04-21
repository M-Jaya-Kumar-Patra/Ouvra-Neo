// lib/models/Split.ts
import mongoose, { Schema, model, models } from "mongoose";

const SplitSchema = new Schema({
  userId: { type: String, required: true }, // The person who paid (e.g., Jaya)
  totalAmount: { type: Number, required: true },
  description: { type: String, default: "Group Expense" },
  participants: [
    {
      userId: { type: String }, // Optional: If the friend is a registered user
      name: { type: String, required: true },
      share: { type: Number, required: true },
      status: { 
        type: String, 
        enum: ["pending", "completed"], 
        default: "pending" 
      },
      paymentNote: { type: String }, // The "SPLIT-XXXX" code for your bank statement
    }
  ],
  createdAt: { type: Date, default: Date.now },
  merchantUpi: { type: String, default: "" },
merchantName: { type: String, default: "" },
merchantCode: { type: String },
});

const Split = models.Split || model("Split", SplitSchema);
export default Split;