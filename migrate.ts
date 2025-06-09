// migration.js
import mongoose from "mongoose";

// Old schemas (for reading existing data)
const OldAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    type: String,
    balance: Number,
    currency: String,
    description: String,
  },
  { timestamps: true }
);

const OldFlowTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: String,
    amount: Number,
    currency: String,
    category: String,
    description: String,
    fromAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    date: Date,
  },
  { timestamps: true }
);

// New schemas
const BalanceSchema = new mongoose.Schema({
  currency: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
});

const NewAccountSchema = new mongoose.Schema(
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
  { timestamps: true }
);

const TransferDetailsSchema = new mongoose.Schema({
  fromCurrency: { type: String, required: true },
  fromAmount: { type: Number, required: true },
  toCurrency: { type: String, required: true },
  toAmount: { type: Number, required: true },
});

const NewTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
  { timestamps: true }
);

// Create models
const OldAccount = mongoose.model("OldAccount", OldAccountSchema, "accounts");
const OldFlowTransaction = mongoose.model(
  "OldFlowTransaction",
  OldFlowTransactionSchema,
  "transactions"
);
const NewAccount = mongoose.model("Account", NewAccountSchema, "flowaccounts");
const NewTransaction = mongoose.model(
  "Transaction",
  NewTransactionSchema,
  "flowtransactions"
);

async function migrateData() {
  try {
    console.log("Starting migration...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.DB_URI || "mongodb://localhost:27017/your-database"
    );

    // Migrate Accounts
    console.log("Migrating accounts...");
    const oldAccounts = await OldAccount.find({});
    const accountIdMapping = new Map(); // Map old ObjectId to new string ID

    for (const oldAccount of oldAccounts) {
      const newAccountData = {
        _id: new mongoose.Types.ObjectId(oldAccount._id.toString()),
        userId: new mongoose.Types.ObjectId(oldAccount.userId!.toString()), // Convert ObjectId to string
        name: oldAccount.name,
        description: oldAccount.description,
        type: oldAccount.type,
        balances: [
          {
            currency: oldAccount.currency || "USD",
            amount: oldAccount.balance || 0,
          },
        ],
        createdAt: oldAccount.createdAt,
        updatedAt: oldAccount.updatedAt,
      };

      const newAccount = new NewAccount(newAccountData);
      const savedAccount = await newAccount.save();

      // Store mapping for transaction migration
      accountIdMapping.set(
        oldAccount._id.toString(),
        savedAccount._id.toString()
      );

      console.log(`Migrated account: ${oldAccount.name}`);
    }

    // Migrate Transactions
    console.log("Migrating transactions...");
    const oldTransactions = await OldFlowTransaction.find({});

    for (const oldTransaction of oldTransactions) {
      let newTransactionData: any = {
        _id: new mongoose.Types.ObjectId(oldTransaction._id),
        userId: new mongoose.Types.ObjectId(oldTransaction.userId!),
        type: oldTransaction.type,
        amount: oldTransaction.amount,
        currency: oldTransaction.currency,
        category: oldTransaction.category,
        description: oldTransaction.description || "",
        date: oldTransaction.date,
        createdAt: oldTransaction.createdAt,
        updatedAt: oldTransaction.updatedAt,
      };

      // Handle account references
      if (oldTransaction.type === "transfer") {
        // For transfers, use fromAccountId as accountId
        newTransactionData.accountId = new mongoose.Types.ObjectId(
          oldTransaction.fromAccountId!
        );
        (newTransactionData.toAccountId = new mongoose.Types.ObjectId(
          oldTransaction.toAccountId!
        )),
          // Create transferDetails (assuming same currency for now)
          (newTransactionData.transferDetails = {
            fromCurrency: oldTransaction.currency,
            fromAmount: oldTransaction.amount,
            toCurrency: oldTransaction.currency,
            toAmount: oldTransaction.amount,
          });
      } else {
        // For income/expense, use fromAccountId or toAccountId as accountId
        newTransactionData.accountId = new mongoose.Types.ObjectId(
          (oldTransaction.fromAccountId || oldTransaction.toAccountId)!
        );
      }

      const newTransaction = new NewTransaction(newTransactionData);
      await newTransaction.save();

      console.log(
        `Migrated transaction: ${oldTransaction.type} - ${oldTransaction.amount}`
      );
    }

    console.log("Migration completed successfully!");

    // Optional: Verify migration
    const newAccountCount = await NewAccount.countDocuments();
    const newTransactionCount = await NewTransaction.countDocuments();
    console.log(
      `Migrated ${newAccountCount} accounts and ${newTransactionCount} transactions`
    );
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Optional: Rollback function
async function rollbackMigration() {
  try {
    console.log("Rolling back migration...");
    await mongoose.connect(
      process.env.DB_URI || "mongodb://localhost:27017/your-database"
    );

    // Delete migrated data
    await NewAccount.deleteMany({});
    await NewTransaction.deleteMany({});

    console.log("Rollback completed");
  } catch (error) {
    console.error("Rollback failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run migration
if (process.argv[2] === "rollback") {
  rollbackMigration();
} else {
  migrateData();
}

export { migrateData, rollbackMigration };
