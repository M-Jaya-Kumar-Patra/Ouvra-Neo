import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String },
    fullName: { type: String },
    upiId: { type: String },
    balance: { type: Number, default: 0 },
    is2FAEnabled: { type: Boolean, default: false },
    twoFASecret: { type: String }, // Encrypted secret for TOTP
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
    history: [
      {
        amount: Number,
        type: { type: String, enum: ["round-up", "manual"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  
  profile: {
    occupation: { type: String, default: 'General User' },
    monthlyBudget: { type: Number, default: 0 },
    financialGoal: { type: String, default: 'Stability' },
    isProfileComplete: { type: Boolean, default: false } // Safety flag
  },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

// ... rest of your schema
