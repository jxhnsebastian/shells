export type AccountType = "bank" | "crypto_wallet" | "crypto_card" | "other";
export type TransactionType = "expense" | "income" | "transfer";
export type Currency = "USD" | "INR";

export interface Account {
  _id?: string;
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id?: string;
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: string;
  description: string;
  fromAccountId?: string; // for transfers and expenses
  toAccountId?: string; // for transfers and income
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowInsights {
  totalBalance: { [key in Currency]: number };
  monthlyExpenses: { [key in Currency]: number };
  monthlyIncome: { [key in Currency]: number };
  categoryBreakdown: { [category: string]: number };
  accountBalances: { [accountId: string]: number };
}
