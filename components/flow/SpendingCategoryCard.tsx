import { useState } from "react";
import { useFlowContext } from "../context/FlowContext";
import { useSearchContext } from "../context/SearchContext";
import { CategoryDataPoint, CurrencyView } from "./InsightsTab";
import { Transaction } from "@/lib/flow-types";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function SpendingCategoryCard({
  category,
  currencyView,
}: {
  category: CategoryDataPoint;
  currencyView: CurrencyView;
}) {
  const { formatCurrency } = useSearchContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg bg-gray-800/50 overflow-hidden">
        {/* Category Header */}
        <CollapsibleTrigger className="w-full p-3 hover:bg-gray-700/30 transition-colors">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="text-xs text-gray-400 ml-2">
                ({category.transactions.length} transactions)
              </span>
            </div>
            <span className="font-semibold">
              {formatCurrency(
                category.value,
                currencyView === "inr" ? "INR" : "USD"
              )}
            </span>
          </div>
        </CollapsibleTrigger>

        {/* Transactions Dropdown */}
        <CollapsibleContent>
          <div className="border-t border-gray-700/50 max-h-[20rem] overflow-y-auto">
            {category.transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                No transactions in this category
              </div>
            ) : (
              <div className="divide-y divide-gray-700/30">
                {category.transactions.map((transaction, index) => (
                  <TransactionCard
                    key={index}
                    transaction={transaction}
                    currencyView={currencyView}
                  />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function TransactionCard({
  transaction,
  currencyView,
}: {
  transaction: Transaction;
  currencyView: CurrencyView;
}) {
  const { formatCurrency } = useSearchContext();
  const { getAccountName } = useFlowContext();
  return (
    <div className="flex-1 min-w-0 p-2">
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
              ? `${getAccountName(transaction.accountId)} → ${getAccountName(
                  transaction.toAccountId
                )}`
              : transaction.type === "expense" && transaction.accountId
              ? `From ${getAccountName(transaction.accountId)}`
              : transaction.type === "income" && transaction.accountId
              ? `To ${getAccountName(transaction.accountId)}`
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
              currencyView === "inr" ? "INR" : "USD"
            )}
          </div>

          {/* Date and time */}
          <div className="text-xs md:text-sm text-white/50">
            {new Date(transaction.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
