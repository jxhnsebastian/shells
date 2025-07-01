export type AccountType = "bank" | "crypto_wallet" | "crypto_card" | "other";
export type TransactionType = "expense" | "income" | "transfer";
export type Currency = "USD" | "INR" | "SOL";

export const commonCategories = {
  expense: [
    "Food",
    "Transportation",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Other",
  ],
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  transfer: ["Transfer"],
};

export interface Balance {
  currency: string;
  amount: number;
}

export interface Account {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  type: "bank" | "crypto_card" | "crypto_wallet" | "other";
  balances: Balance[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferDetails {
  fromCurrency: string;
  fromAmount: number;
  toCurrency: string;
  toAmount: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  currency: string;
  category: string;
  description?: string;
  accountId: string;
  toAccountId?: string;
  transferDetails?: TransferDetails;
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

export interface TimeSeriesEntry {
  time: string;
  amount: number;
  currency: string;
}

export interface TimeSeries {
  byType?: {
    [transactionType: string]: TimeSeriesEntry[];
  };
  byCategory?: {
    [category: string]: TimeSeriesEntry[];
  };
}

export interface InsightsData {
  totalBalance: { [currency: string]: number };
  income: { [currency: string]: number };
  expense: { [currency: string]: number };
  transfer: { [currency: string]: number };
  categorySpending: {
    [category: string]: { [currency: string]: number };
  };
  accountBalances: {
    [accountId: string]: { [currency: string]: number };
  };
  accounts: Account[];
  timeSeries: TimeSeries;
  dateRange: {
    start: string;
    end: string;
    groupBy: "day" | "week" | "month";
  };
  transactionCount: number;
}

export interface InsightsResponse {
  success: boolean;
  insights: InsightsData;
}

export interface ErrorResponse {
  error: string;
}

export const CURRENCIES = ["USD", "INR", "SOL"];
