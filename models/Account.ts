import mongoose, { Schema, Document, Model } from "mongoose";

interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "bank" | "crypto_wallet" | "crypto_card" | "other";
  balance: number;
  currency: "USD" | "INR";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["bank", "crypto_wallet", "crypto_card", "other"],
      required: true,
    },
    balance: { type: Number, required: true, default: 0 },
    currency: {
      type: String,
      enum: ["USD", "INR"],
      required: true,
      default: "USD",
    },
    description: { type: String },
  },
  { timestamps: true }
);

const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);

export default Account;
