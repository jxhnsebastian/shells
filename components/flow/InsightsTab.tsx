"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { Currency } from "@/lib/flow-types";
import { useSearchContext } from "../context/SearchContext";

interface InsightsTabProps {
  isLoading: boolean;
}

interface InsightsData {
  totalBalance: { [key in Currency]: number };
  monthlyExpenses: { [key in Currency]: number };
  monthlyIncome: { [key in Currency]: number };
  categoryBreakdown: { [category: string]: number };
  accountBalances: { [accountId: string]: number };
  accounts: any[];
}

export default function InsightsTab({ isLoading }: InsightsTabProps) {
  const { formatCurrency } = useSearchContext();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch("/api/flow/insights");
        const data = await response.json();
        if (data.success) {
          setInsights(data.insights);
        }
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchInsights();
    }
  }, [isLoading]);

  if (loading || isLoading) {
    return <div className="text-center py-8">Loading insights...</div>;
  }

  if (!insights) {
    return <div className="text-center py-8">No data available</div>;
  }

  const currencies: Currency[] = ["USD", "INR"];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">financial insights</h2>

      {/* Total Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currencies.map((currency) => (
          <Card key={currency}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                total balance ({currency})
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(insights.totalBalance[currency] || 0, currency)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencies.map((currency) => (
          <div key={currency} className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  monthly income ({currency})
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    insights.monthlyIncome[currency] || 0,
                    currency
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  monthly expenses ({currency})
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    insights.monthlyExpenses[currency] || 0,
                    currency
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            expense categories this month
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {Object.keys(insights.categoryBreakdown).length === 0 ? (
            <p className="text-muted-foreground">no expenses this month</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(insights.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <Badge variant="outline">{category.toLowerCase()}</Badge>
                    <span className="font-medium">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            account balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.accounts.length === 0 ? (
            <p className="text-muted-foreground">no accounts created</p>
          ) : (
            <div className="space-y-3">
              {insights.accounts.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {account.type.replace("_", " ")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    <Badge variant="secondary">{account.currency}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
