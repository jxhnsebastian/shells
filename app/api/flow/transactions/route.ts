import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import FlowTransaction from "@/models/Transaction";
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

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filter parameters
    const accountId = searchParams.get("accountId");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter query
    const filterQuery: any = { userId };

    if (accountId) {
      filterQuery.$or = [{ accountId }, { toAccountId: accountId }];
    }

    if (type) {
      filterQuery.type = type;
    }

    if (category) {
      filterQuery.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      filterQuery.date = {};
      if (startDate) {
        filterQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 23:59:59 to include the entire end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filterQuery.date.$lte = endDateTime;
      }
    }

    // Fetch transactions with filters
    const transactions = await FlowTransaction.find(filterQuery)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalTransactions = await FlowTransaction.countDocuments(filterQuery);
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
      filters: {
        accountId,
        type,
        category,
        startDate,
        endDate,
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
      accountId,
      toAccountId,
      transferDetails,
      date,
    } = await request.json();

    if (
      !type ||
      !amount ||
      !currency ||
      !category ||
      !description ||
      !accountId
    ) {
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
            accountId,
            toAccountId: toAccountId || null,
            transferDetails,
            date: date ? new Date(date) : new Date(),
          },
        ],
        { session: session_db }
      );

      // Update account balances
      if (type === "expense" && accountId) {
        await Account.findByIdAndUpdate(
          accountId,
          { $inc: { "balances.$[elem].amount": -amount } },
          {
            arrayFilters: [{ "elem.currency": currency }],
            session: session_db,
          }
        );
      } else if (type === "income" && toAccountId) {
        await Account.findByIdAndUpdate(
          toAccountId,
          { $inc: { "balances.$[elem].amount": amount } },
          {
            arrayFilters: [{ "elem.currency": currency }],
            session: session_db,
          }
        );
      } else if (type === "transfer" && accountId && toAccountId) {
        // For transfers, use transferDetails currencies if available
        const fromCurrency = transferDetails?.fromCurrency || currency;
        const toCurrency = transferDetails?.toCurrency || currency;
        const fromAmount = transferDetails?.fromAmount || amount;
        const toAmount = transferDetails?.toAmount || amount;

        await Account.findByIdAndUpdate(
          accountId,
          { $inc: { "balances.$[elem].amount": -fromAmount } },
          {
            arrayFilters: [{ "elem.currency": fromCurrency }],
            session: session_db,
          }
        );
        await Account.findByIdAndUpdate(
          toAccountId,
          { $inc: { "balances.$[elem].amount": toAmount } },
          {
            arrayFilters: [{ "elem.currency": toCurrency }],
            session: session_db,
          }
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
