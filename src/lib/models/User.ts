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

    language: { 
    type: String, 
    enum: ["English", "Hindi", "Telugu", "Tamil", "Bengali", "Hinglish"], 
    default: "English" 
  }, // Added this
  
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
      isProfileComplete: { type: Boolean, default: false },
      
      // --- NEW ROUND-UP SETTINGS ---
      isRoundUpEnabled: { type: Boolean, default: true },
      roundUpRule: { 
        type: Number, 
        enum: [1, 5, 10, 50, 100], 
        default: 10 
      }, 
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

// ... rest of your schema
