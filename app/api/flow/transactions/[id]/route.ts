import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import FlowTransaction from "@/models/Transaction";
import Account from "@/models/Account";
import connectToDatabase from "@/lib/database";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    const session_db = await mongoose.startSession();
    session_db.startTransaction();

    try {
      // Find the transaction first
      const transaction = await FlowTransaction.findOne({
        _id: id,
        userId,
      }).session(session_db);

      if (!transaction) {
        await session_db.abortTransaction();
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }

      // Reverse the account balance changes
      if (transaction.type === "expense" && transaction.accountId) {
        await Account.findByIdAndUpdate(
          transaction.accountId,
          { $inc: { "balances.$[elem].amount": transaction.amount } },
          {
            arrayFilters: [{ "elem.currency": transaction.currency }],
            session: session_db,
          }
        );
      } else if (transaction.type === "income" && transaction.accountId) {
        await Account.findByIdAndUpdate(
          transaction.accountId,
          { $inc: { "balances.$[elem].amount": -transaction.amount } },
          {
            arrayFilters: [{ "elem.currency": transaction.currency }],
            session: session_db,
          }
        );
      } else if (
        transaction.type === "transfer" &&
        transaction.accountId &&
        transaction.toAccountId
      ) {
        // For transfers, use transferDetails currencies if available
        const fromCurrency =
          transaction.transferDetails?.fromCurrency || transaction.currency;
        const toCurrency =
          transaction.transferDetails?.toCurrency || transaction.currency;
        const fromAmount =
          transaction.transferDetails?.fromAmount || transaction.amount;
        const toAmount =
          transaction.transferDetails?.toAmount || transaction.amount;

        await Account.findByIdAndUpdate(
          transaction.accountId,
          { $inc: { "balances.$[elem].amount": fromAmount } },
          {
            arrayFilters: [{ "elem.currency": fromCurrency }],
            session: session_db,
          }
        );
        await Account.findByIdAndUpdate(
          transaction.toAccountId,
          { $inc: { "balances.$[elem].amount": -toAmount } },
          {
            arrayFilters: [{ "elem.currency": toCurrency }],
            session: session_db,
          }
        );
      }

      // Delete the transaction
      await FlowTransaction.findByIdAndDelete(id).session(session_db);

      await session_db.commitTransaction();
      return NextResponse.json({ success: true });
    } catch (error) {
      await session_db.abortTransaction();
      throw error;
    } finally {
      session_db.endSession();
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
