import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import FlowTransaction from "@/models/FlowTransaction";
import Account from "@/models/Account";
import connectToDatabase from "@/lib/database";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const transactions = await FlowTransaction.find({ userId })
      .populate("fromAccountId", "name")
      .populate("toAccountId", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await FlowTransaction.countDocuments({ userId });
    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTransactions,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const {
      type,
      amount,
      currency,
      category,
      description,
      fromAccountId,
      toAccountId,
      date,
    } = await request.json();

    if (!type || !amount || !currency || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session_db = await mongoose.startSession();
    session_db.startTransaction();

    try {
      // Create transaction
      const transaction = await FlowTransaction.create(
        [
          {
            userId,
            type,
            amount,
            currency,
            category,
            description,
            fromAccountId: fromAccountId || null,
            toAccountId: toAccountId || null,
            date: date ? new Date(date) : new Date(),
          },
        ],
        { session: session_db }
      );

      // Update account balances
      if (type === "expense" && fromAccountId) {
        await Account.findByIdAndUpdate(
          fromAccountId,
          { $inc: { balance: -amount } },
          { session: session_db }
        );
      } else if (type === "income" && toAccountId) {
        await Account.findByIdAndUpdate(
          toAccountId,
          { $inc: { balance: amount } },
          { session: session_db }
        );
      } else if (type === "transfer" && fromAccountId && toAccountId) {
        await Account.findByIdAndUpdate(
          fromAccountId,
          { $inc: { balance: -amount } },
          { session: session_db }
        );
        await Account.findByIdAndUpdate(
          toAccountId,
          { $inc: { balance: amount } },
          { session: session_db }
        );
      }

      await session_db.commitTransaction();
      return NextResponse.json({ success: true, transaction: transaction[0] });
    } catch (error) {
      await session_db.abortTransaction();
      throw error;
    } finally {
      session_db.endSession();
    }
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
