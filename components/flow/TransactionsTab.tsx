"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Currency, Transaction, commonCategories } from "@/lib/flow-types";
import TransactionDialog from "./TransactionDialog";
import { useSearchContext } from "../context/SearchContext";
import { Filters, useFlowContext } from "../context/FlowContext";
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  Heart,
  MoreHorizontal,
  Banknote,
  Briefcase,
  TrendingUp,
  Gift,
  ArrowLeftRight,
} from "lucide-react";

interface TransactionsTabProps {
  transactions: Transaction[];
  onTransactionsChange: () => void;
  isLoading: boolean;
}

const transactionTypes = ["income", "expense", "transfer"];

export default function TransactionsTab({}: TransactionsTabProps) {
  const { formatCurrency } = useSearchContext();
  const {
    accounts,
    transactions,
    fetchTransactions,
    flowLoading,
    pagination,
    fetchAccounts,
  } = useFlowContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

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
        await fetchTransactions(pagination.currentPage);
        await fetchAccounts();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc._id === accountId);
    return account?.name || "Unknown Account";
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchTransactions(1, 20, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchTransactions(1, 20, {});
  };

  const handlePageChange = (page: number) => {
    fetchTransactions(page, 20, filters);
  };

  const getFilteredCategories = () => {
    if (!filters.type) return [];
    return (
      commonCategories[filters.type as keyof typeof commonCategories] || []
    );
  };

  // Group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, transactions]) => ({
        date,
        transactions: transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      // Expense categories
      Food: UtensilsCrossed,
      Transportation: Car,
      Shopping: ShoppingBag,
      Bills: Receipt,
      Entertainment: Gamepad2,
      Healthcare: Heart,
      Other: MoreHorizontal,
      // Income categories
      Salary: Banknote,
      Freelance: Briefcase,
      Investment: TrendingUp,
      Gift: Gift,
      // Transfer
      Transfer: ArrowLeftRight,
    };

    return iconMap[category] || MoreHorizontal;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold mb-2 md:mb-0">your transactions</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden md:flex ml-2">filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Button onClick={handleCreateTransaction} size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden md:flex ml-2">add transaction</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Account Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Account</label>
                <Select
                  value={filters.accountId || ""}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "accountId",
                      value === "all" ? undefined : value || undefined
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account._id} value={account._id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type || ""}
                  onValueChange={(value) => {
                    handleFilterChange(
                      "type",
                      value === "all" ? undefined : value || undefined
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.category || ""}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "category",
                      value === "all" ? undefined : value || undefined
                    )
                  }
                  disabled={!filters.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {getFilteredCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {filters.startDate
                        ? filters.startDate.toLocaleDateString()
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => handleFilterChange("startDate", date)}
                      className="rounded-lg border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {filters.endDate
                        ? filters.endDate.toLocaleDateString()
                        : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => handleFilterChange("endDate", date)}
                      className="rounded-lg border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      {flowLoading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {activeFiltersCount > 0
                ? "No transactions found with current filters"
                : "No transactions yet"}
            </p>
            {activeFiltersCount === 0 && (
              <Button onClick={handleCreateTransaction} className="mt-4">
                record your first transaction
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedTransactions.map(({ date, transactions }) => (
            <div key={date} className="space-y-3">
              {/* Date Divider */}
              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <div className="px-3 py-1 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <Separator className="flex-1" />
              </div>

              {/* Transactions for this date */}
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  return (
                    <Card
                      key={transaction._id}
                      className="group relative overflow-hidden border-0 bg-white/2 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 p-0 mb-2 md:mb-3"
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center gap-2 md:gap-4 p-2 md:p-4">
                          {/* Category Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:bg-white/15">
                              {(() => {
                                const IconComponent = getCategoryIcon(
                                  transaction.category
                                );
                                return (
                                  <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
                                );
                              })()}
                            </div>
                          </div>

                          {/* Transaction Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              {/* Left side - Description and details */}
                              <div className="min-w-0 flex-1">
                                <span className="font-extralight text-white text-sm leading-tight mb-1 truncate">
                                  {transaction.description}
                                </span>

                                {/* Account info */}
                                <div className="text-xs md:text-sm text-white/60 mb-1">
                                  {transaction.type === "transfer" &&
                                  transaction.accountId &&
                                  transaction.toAccountId
                                    ? `${getAccountName(
                                        transaction.accountId
                                      )} → ${getAccountName(
                                        transaction.toAccountId
                                      )}`
                                    : transaction.type === "expense" &&
                                      transaction.accountId
                                    ? `From ${getAccountName(
                                        transaction.accountId
                                      )}`
                                    : transaction.type === "income" &&
                                      transaction.accountId
                                    ? `To ${getAccountName(
                                        transaction.accountId
                                      )}`
                                    : ""}
                                </div>

                                {/* Category */}
                                {/* <div className="text-sm text-white/50">
                                  {transaction.category}
                                </div> */}
                              </div>

                              {/* Right side - Amount and date */}
                              <div className="flex-shrink-0 text-right">
                                <div
                                  className={`font-bold text-sm md:text-lg leading-tight mb-1 ${
                                    transaction.type === "expense"
                                      ? "text-red-500"
                                      : transaction.type === "income"
                                      ? "text-green-500"
                                      : "text-blue-500"
                                  }`}
                                >
                                  {transaction.type === "expense"
                                    ? "- "
                                    : transaction.type === "income"
                                    ? "+ "
                                    : ""}
                                  {formatCurrency(
                                    transaction.amount,
                                    transaction.currency as Currency
                                  )}
                                </div>

                                {/* Date and time */}
                                <div className="text-xs md:text-sm text-white/50">
                                  {new Date(
                                    transaction.date
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delete button - only visible on hover */}
                          <div className="flex-shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-500 transition-all duration-300"
                              onClick={() =>
                                handleDeleteTransaction(transaction._id!)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">
                                Delete transaction
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="text-sm text-muted-foreground mb-2 md:mb-0">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum: number = 0;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.currentPage
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        accounts={accounts}
        onSuccess={() => {
          fetchTransactions();
          fetchAccounts();
        }}
      />
    </div>
  );
}
