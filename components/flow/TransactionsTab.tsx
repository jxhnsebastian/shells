"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Account, Transaction } from "@/lib/flow-types";
import TransactionDialog from "./TransactionDialog";
import { useSearchContext } from "../context/SearchContext";

interface TransactionsTabProps {
  transactions: Transaction[];
  accounts: Account[];
  onTransactionsChange: () => void;
  isLoading: boolean;
}

const transactionTypeIcons = {
  expense: ArrowUpRight,
  income: ArrowDownLeft,
  transfer: ArrowRightLeft,
};

const transactionTypeColors = {
  expense: "destructive",
  income: "default",
  transfer: "secondary",
} as const;

export default function TransactionsTab({
  transactions,
  accounts,
  onTransactionsChange,
  isLoading,
}: TransactionsTabProps) {
  const { formatCurrency } = useSearchContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTransaction = () => {
    setIsDialogOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await fetch(`/api/flow/transactions/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onTransactionsChange();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc._id === accountId);
    return account?.name || "Unknown Account";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">your transactions</h2>
        <Button onClick={handleCreateTransaction} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          add transaction
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">no transactions yet</p>
            <Button onClick={handleCreateTransaction} className="mt-4">
              record your first transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const IconComponent = transactionTypeIcons[transaction.type];
            return (
              <Card key={transaction._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {transaction.description}
                          </span>
                          <Badge
                            variant={transactionTypeColors[transaction.type]}
                          >
                            {transaction.type}
                          </Badge>
                          <Badge variant="outline">
                            {transaction.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.type === "transfer" &&
                          transaction.fromAccountId &&
                          transaction.toAccountId
                            ? `${getAccountName(
                                transaction.fromAccountId
                              )} → ${getAccountName(transaction.toAccountId)}`
                            : transaction.type === "expense" &&
                              transaction.fromAccountId
                            ? `from ${getAccountName(
                                transaction.fromAccountId
                              )}`
                            : transaction.type === "income" &&
                              transaction.toAccountId
                            ? `to ${getAccountName(transaction.toAccountId)}`
                            : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          transaction.type === "expense"
                            ? "text-red-600"
                            : transaction.type === "income"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {transaction.type === "expense"
                          ? "-"
                          : transaction.type === "income"
                          ? "+"
                          : ""}
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteTransaction(transaction._id!)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        accounts={accounts}
        onSuccess={onTransactionsChange}
      />
    </div>
  );
}
