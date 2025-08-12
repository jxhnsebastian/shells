"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Account,
  TransactionType,
  Currency,
  commonCategories,
} from "@/lib/flow-types";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSuccess: () => void;
}

export default function TransactionDialog({
  isOpen,
  onClose,
  accounts,
  onSuccess,
}: TransactionDialogProps) {
  // Helper function to get current date and time in local timezone
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    type: "expense" as TransactionType,
    amount: 0,
    currency: "USD" as Currency,
    category: "",
    description: "",
    accountId: "",
    toAccountId: "",
    date: getCurrentDateTime(),
  });

  // Transfer details for cross-currency
  const [transferDetails, setTransferDetails] = useState({
    fromCurrency: "USD" as Currency,
    toCurrency: "USD" as Currency,
    fromAmount: 0,
    toAmount: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const isDifferentCurrency =
    formData.type === "transfer" &&
    transferDetails.fromCurrency !== transferDetails.toCurrency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };
      console.log(transferDetails);
      console.log(payload);
      // Add transfer details if currencies are different for transfers
      if (formData.type === "transfer") {
        payload.amount = transferDetails.fromAmount;
        payload.currency = transferDetails.fromCurrency;
        payload.transferDetails = transferDetails;
      }
      console.log(payload);
      // return
      const response = await fetch("/api/flow/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          type: "expense",
          amount: 0,
          currency: "USD",
          category: "",
          description: "",
          accountId: "",
          toAccountId: "",
          date: getCurrentDateTime(),
        });
        setTransferDetails({
          fromCurrency: "USD",
          toCurrency: "USD",
          fromAmount: 0,
          toAmount: 0,
        });
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData({
      ...formData,
      type,
      category: "",
      accountId: "",
      toAccountId: "",
    });

    // Reset transfer details when changing transaction type
    if (type !== "transfer") {
      setTransferDetails({
        fromCurrency: "USD",
        toCurrency: "USD",
        fromAmount: 0,
        toAmount: 0,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-black text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">add transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">
              transaction type
            </Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-black border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem
                  value="expense"
                  className="text-white hover:bg-gray-800"
                >
                  expense
                </SelectItem>
                <SelectItem
                  value="income"
                  className="text-white hover:bg-gray-800"
                >
                  income
                </SelectItem>
                <SelectItem
                  value="transfer"
                  className="text-white hover:bg-gray-800"
                >
                  transfer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount and Currency fields for non-transfer or same-currency transfers */}
          {formData.type !== "transfer" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-black border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">
                  currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: Currency) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem
                      value="USD"
                      className="text-white hover:bg-gray-800"
                    >
                      USD
                    </SelectItem>
                    <SelectItem
                      value="INR"
                      className="text-white hover:bg-gray-800"
                    >
                      INR
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">
              category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="bg-black border-gray-700 text-white">
                <SelectValue placeholder="select category" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                {commonCategories[formData.type].map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-white hover:bg-gray-800"
                  >
                    {category.toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-black border-gray-700 text-white"
              required
            />
          </div>

          {formData.type === "expense" && (
            <div className="space-y-2">
              <Label htmlFor="fromAccount" className="text-white">
                from account
              </Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountId: value })
                }
              >
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="select account" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  {accounts.map((account) => (
                    <SelectItem
                      key={account._id}
                      value={account._id!}
                      className="text-white hover:bg-gray-800"
                    >
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === "income" && (
            <div className="space-y-2">
              <Label htmlFor="toAccount" className="text-white">
                to account
              </Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountId: value })
                }
              >
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="select account" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  {accounts.map((account) => (
                    <SelectItem
                      key={account._id}
                      value={account._id!}
                      className="text-white hover:bg-gray-800"
                    >
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === "transfer" && (
            <>
              {/* From Account with Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fromAccount" className="text-white">
                    from account
                  </Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, accountId: value })
                    }
                  >
                    <SelectTrigger className="bg-black border-gray-700 text-white">
                      <SelectValue placeholder="select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      {accounts.map((account) => (
                        <SelectItem
                          key={account._id}
                          value={account._id!}
                          className="text-white hover:bg-gray-800"
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromCurrency" className="text-white">
                    currency
                  </Label>
                  <Select
                    value={transferDetails.fromCurrency}
                    onValueChange={(value: Currency) =>
                      setTransferDetails({
                        ...transferDetails,
                        fromCurrency: value,
                      })
                    }
                  >
                    <SelectTrigger className="bg-black border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      <SelectItem
                        value="USD"
                        className="text-white hover:bg-gray-800"
                      >
                        USD
                      </SelectItem>
                      <SelectItem
                        value="INR"
                        className="text-white hover:bg-gray-800"
                      >
                        INR
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* To Account with Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="toAccount" className="text-white">
                    to account
                  </Label>
                  <Select
                    value={formData.toAccountId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, toAccountId: value })
                    }
                  >
                    <SelectTrigger className="bg-black border-gray-700 text-white">
                      <SelectValue placeholder="select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      {accounts
                        .filter((acc) => acc._id !== formData.accountId)
                        .map((account) => (
                          <SelectItem
                            key={account._id}
                            value={account._id!}
                            className="text-white hover:bg-gray-800"
                          >
                            {account.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toCurrency" className="text-white">
                    currency
                  </Label>
                  <Select
                    value={transferDetails.toCurrency}
                    onValueChange={(value: Currency) =>
                      setTransferDetails({
                        ...transferDetails,
                        toCurrency: value,
                      })
                    }
                  >
                    <SelectTrigger className="bg-black border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      <SelectItem
                        value="USD"
                        className="text-white hover:bg-gray-800"
                      >
                        USD
                      </SelectItem>
                      <SelectItem
                        value="INR"
                        className="text-white hover:bg-gray-800"
                      >
                        INR
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cross-currency amounts */}
              {isDifferentCurrency && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAmount" className="text-white">
                      from amount ({transferDetails.fromCurrency})
                    </Label>
                    <Input
                      id="fromAmount"
                      type="number"
                      step="0.01"
                      value={transferDetails.fromAmount}
                      onChange={(e) =>
                        setTransferDetails({
                          ...transferDetails,
                          fromAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-black border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toAmount" className="text-white">
                      to amount ({transferDetails.toCurrency})
                    </Label>
                    <Input
                      id="toAmount"
                      type="number"
                      step="0.01"
                      value={transferDetails.toAmount}
                      onChange={(e) =>
                        setTransferDetails({
                          ...transferDetails,
                          toAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-black border-gray-700 text-white"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Same currency amount */}
              {!isDifferentCurrency && (
                <div className="space-y-2">
                  <Label htmlFor="transferAmount" className="text-white">
                    amount
                  </Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      });
                      setTransferDetails({
                        ...transferDetails,
                        toAmount: parseFloat(e.target.value) || 0,
                        fromAmount: parseFloat(e.target.value) || 0,
                      });
                    }}
                    className="bg-black border-gray-700 text-white"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="date" className="text-white">
              date & time
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="bg-black border-gray-700 text-white"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto bg-black border-gray-700 text-white hover:bg-gray-800"
            >
              cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
            >
              {isLoading ? "creating..." : "create transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
