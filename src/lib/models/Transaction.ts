import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  // The person who owes (optional for guests)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false // THIS MUST BE FALSE
  },
  
  // Jaya (the one who created the split)
  creatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, 
  
  amount: { type: Number, required: true },
  roundUpAmount: { type: Number, default: 0 },
  description: { type: String, required: true },
  category: { type: String, default: "Bill Split" },
  
  type: {
  type: String,
  required: true,
  enum: ["income", "expense", "owed_to_me", "debt"], // <--- MUST include "income"
},
  
  splitId: { type: mongoose.Schema.Types.ObjectId, ref: "Split" }, 
  guestName: { type: String }, // For your manual names
  
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed"], 
    default: "pending" 
  },
  date: { type: Date, default: Date.now },
});

// Clear the model cache to ensure the new enum is registered
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);