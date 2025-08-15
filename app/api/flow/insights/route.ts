import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import connectToDatabase from "@/lib/database";
import {
  Account as AccountInterface,
  Balance,
  ErrorResponse,
  InsightsResponse,
  TimeSeries,
  TimeSeriesEntry,
  Transaction as TransactionInterface,
} from "@/lib/flow-types";

type ApiResponse = InsightsResponse | ErrorResponse;

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" } as ErrorResponse,
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);

    // Get optional parameters with proper typing
    const accountId: string | null = searchParams.get("accountId");
    const startDate: string | null = searchParams.get("startDate");
    const endDate: string | null = searchParams.get("endDate");

    // Default to current month if no dates provided
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), -1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dateStart: Date = startDate
      ? new Date(parseInt(startDate))
      : defaultStart;
    const dateEnd: Date = endDate ? new Date(parseInt(endDate)) : defaultEnd;

    // Build account filter with proper typing
    const accountFilter: { userId: string; _id?: string } = { userId };
    if (accountId) {
      accountFilter._id = accountId;
    }

    // Get accounts
    const accounts: AccountInterface[] = await Account.find(accountFilter);

    // Calculate total balances by currency from accounts
    const totalBalance: { [currency: string]: number } = accounts.reduce(
      (acc, account) => {
        account.balances.forEach((balance: Balance) => {
          acc[balance.currency] = (acc[balance.currency] || 0) + balance.amount;
        });
        return acc;
      },
      {} as { [currency: string]: number }
    );

    // Build transaction filter with proper typing
    const transactionFilter: {
      userId: string;
      date: { $gte: Date; $lte: Date };
      $or?: Array<{ accountId: string } | { toAccountId: string }>;
    } = {
      userId,
      date: { $gte: dateStart, $lte: dateEnd },
    };

    if (accountId) {
      transactionFilter.$or = [
        { accountId: accountId },
        { toAccountId: accountId },
      ];
    }

    // Get transactions for the date range
    const transactions: TransactionInterface[] = await Transaction.find(
      transactionFilter
    ).sort({
      date: 1,
    });

    // Calculate net amounts by type and currency
    const income: { [currency: string]: number } = {};
    const expense: { [currency: string]: number } = {};
    const transfer: { [currency: string]: number } = {};

    transactions.forEach((transaction: TransactionInterface) => {
      const { type, amount, currency } = transaction;

      switch (type) {
        case "income":
          income[currency] = (income[currency] || 0) + amount;
          break;
        case "expense":
          expense[currency] = (expense[currency] || 0) + amount;
          break;
        case "transfer":
          // For transfers, count based on transferDetails if available
          if (transaction.transferDetails) {
            const { fromCurrency, fromAmount, toCurrency, toAmount } =
              transaction.transferDetails;
            transfer[fromCurrency] = (transfer[fromCurrency] || 0) + fromAmount;
            transfer[toCurrency] = (transfer[toCurrency] || 0) + toAmount;
          } else {
            transfer[currency] = (transfer[currency] || 0) + amount;
          }
          break;
      }
    });

    // Calculate category-wise spending
    const categorySpending: {
      [category: string]: {
        transactions: TransactionInterface[];
        summary: {
          [currency: string]: number;
        };
      };
    } = transactions
      .filter((t: TransactionInterface) => t.type === "expense")
      .reduce(
        (acc, transaction) => {
          const { category, amount, currency } = transaction;
          if (!acc[category]) {
            acc[category] = {
              transactions: [],
              summary: {},
            };
          }
          acc[category].summary[currency] =
            (acc[category].summary[currency] || 0) + amount;
          acc[category].transactions.push(transaction);
          return acc;
        },
        {} as {
          [category: string]: {
            transactions: TransactionInterface[];
            summary: {
              [currency: string]: number;
            };
          };
        }
      );

    // Generate time series data for chart
    const generateTimeSeries = (
      transactions: TransactionInterface[],
      groupBy: "day" | "week" | "month" = "day"
    ): TimeSeries => {
      const series: TimeSeries = {};

      transactions.forEach((transaction: TransactionInterface) => {
        const { type, category, amount, currency, date } = transaction;

        // Create time key based on groupBy
        const transactionDate = new Date(date);
        let timeKey: string = transactionDate.toISOString().split("T")[0]; // YYYY-MM-DD

        if (groupBy === "day") {
          timeKey = transactionDate.toISOString().split("T")[0]; // YYYY-MM-DD
        } else if (groupBy === "week") {
          const weekStart = new Date(transactionDate);
          weekStart.setDate(
            transactionDate.getDate() - transactionDate.getDay()
          );
          timeKey = weekStart.toISOString().split("T")[0];
        } else if (groupBy === "month") {
          timeKey = `${transactionDate.getFullYear()}-${String(
            transactionDate.getMonth() + 1
          ).padStart(2, "0")}`;
        }

        // Time series by transaction type
        if (!series.byType) series.byType = {};
        if (!series.byType[type]) series.byType[type] = [];

        const existingTypeEntry = series.byType[type].find(
          (entry: TimeSeriesEntry) =>
            entry.time === timeKey && entry.currency === currency
        );
        if (existingTypeEntry) {
          existingTypeEntry.amount += amount;
        } else {
          series.byType[type].push({
            time: timeKey,
            amount: amount,
            currency: currency,
          });
        }

        // Time series by category (only for expenses)
        if (type === "expense") {
          if (!series.byCategory) series.byCategory = {};
          if (!series.byCategory[category]) series.byCategory[category] = [];

          const existingCategoryEntry = series.byCategory[category].find(
            (entry: TimeSeriesEntry) =>
              entry.time === timeKey && entry.currency === currency
          );
          if (existingCategoryEntry) {
            existingCategoryEntry.amount += amount;
          } else {
            series.byCategory[category].push({
              time: timeKey,
              amount: amount,
              currency: currency,
            });
          }
        }
      });

      // Sort all series by time
      Object.keys(series.byType || {}).forEach((type: string) => {
        series.byType![type].sort(
          (a: TimeSeriesEntry, b: TimeSeriesEntry) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );
      });

      Object.keys(series.byCategory || {}).forEach((category: string) => {
        series.byCategory![category].sort(
          (a: TimeSeriesEntry, b: TimeSeriesEntry) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );
      });

      return series;
    };

    // Determine grouping based on date range
    const daysDiff: number = Math.ceil(
      (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    let groupBy: "day" | "week" | "month" = "day";
    if (daysDiff > 90) {
      groupBy = "week";
    } else if (daysDiff > 365) {
      groupBy = "month";
    }

    const timeSeries: TimeSeries = generateTimeSeries(transactions, groupBy);

    // Format account balances for response
    const accountBalances: {
      [accountId: string]: { [currency: string]: number };
    } = accounts.reduce((acc, account) => {
      acc[account._id.toString()] = account.balances.reduce(
        (balanceAcc: { [currency: string]: number }, balance: Balance) => {
          balanceAcc[balance.currency] = balance.amount;
          return balanceAcc;
        },
        {}
      );
      return acc;
    }, {} as { [accountId: string]: { [currency: string]: number } });

    const response: InsightsResponse = {
      success: true,
      insights: {
        totalBalance,
        income,
        expense,
        transfer,
        categorySpending,
        accountBalances,
        accounts,
        timeSeries,
        dateRange: {
          start: dateStart.toISOString(),
          end: dateEnd.toISOString(),
          groupBy,
        },
        transactionCount: transactions.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
