import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import FlowTransaction from "@/models/FlowTransaction";
import Account from "@/models/Account";
import connectToDatabase from "@/lib/database";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all accounts
    const accounts = await Account.find({ userId });

    // Calculate total balances by currency
    const totalBalance = accounts.reduce((acc, account) => {
      acc[account.currency] = (acc[account.currency] || 0) + account.balance;
      return acc;
    }, {} as { [key: string]: number });

    // Get monthly transactions
    const monthlyTransactions = await FlowTransaction.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd },
    });

    // Calculate monthly expenses and income
    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.currency] = (acc[t.currency] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => {
        acc[t.currency] = (acc[t.currency] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    // Category breakdown for expenses
    const categoryBreakdown = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    // Account balances
    const accountBalances = accounts.reduce((acc, account) => {
      acc[(account._id as any).toString()] = account.balance;
      return acc;
    }, {} as { [key: string]: number });

    return NextResponse.json({
      success: true,
      insights: {
        totalBalance,
        monthlyExpenses,
        monthlyIncome,
        categoryBreakdown,
        accountBalances,
        accounts,
      },
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
