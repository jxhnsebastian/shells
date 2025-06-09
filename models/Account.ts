import mongoose from "mongoose";

const BalanceSchema = new mongoose.Schema({
  currency: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const AccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      required: true,
      enum: ["bank", "crypto_card", "crypto_wallet", "other"],
    },
    balances: [BalanceSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);
