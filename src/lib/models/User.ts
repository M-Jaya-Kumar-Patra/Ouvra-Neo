import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String },
    fullName: { type: String },
    upiId: { type: String },
    balance: { type: Number, default: 0 },
    vaults: [
      {
        name: String,
        targetAmount: Number,
        currentBalance: { type: Number, default: 0 },
        roundUpEnabled: { type: Boolean, default: false },
      },
    ],
    aiPreferences: {
      notificationsEnabled: { type: Boolean, default: true },
      riskTolerance: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
    },
    history: [{
    amount: Number,
    type: { type: String, enum: ['round-up', 'manual'] },
    createdAt: { type: Date, default: Date.now }
  }]
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

// ... rest of your schema
