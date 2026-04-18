// lib/models/Transaction.ts
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "Other" },
  // ADD THESE FIELDS:
  type: { type: String, enum: ["income", "expense"], required: true }, 
  splitId: { type: mongoose.Schema.Types.ObjectId, ref: "Split" }, 
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed"], 
    default: "pending" 
  },
  paymentNote: { type: String },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);