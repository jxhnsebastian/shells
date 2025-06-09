import mongoose from "mongoose";

const TransferDetailsSchema = new mongoose.Schema({
  fromCurrency: { type: String, required: true },
  fromAmount: { type: Number, required: true },
  toCurrency: { type: String, required: true },
  toAmount: { type: Number, required: true },
});

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense", "transfer"],
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    transferDetails: TransferDetailsSchema,
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
