import mongoose, { Schema, Document, Model } from "mongoose";

interface IFlowTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "expense" | "income" | "transfer";
  amount: number;
  currency: "USD" | "INR";
  category: string;
  description: string;
  fromAccountId?: mongoose.Types.ObjectId;
  toAccountId?: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlowTransactionSchema = new Schema<IFlowTransaction>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["expense", "income", "transfer"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: ["USD", "INR"],
      required: true,
    },
    category: { type: String, required: true },
    description: { type: String, required: true },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const FlowTransaction: Model<IFlowTransaction> =
  mongoose.models.FlowTransaction ||
  mongoose.model<IFlowTransaction>("FlowTransaction", FlowTransactionSchema);

export default FlowTransaction;
