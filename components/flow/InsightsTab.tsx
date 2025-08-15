import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import {
  Account,
  InsightsData,
  InsightsResponse,
  Transaction,
} from "@/lib/flow-types";
import SpendingCategoryCard from "./SpendingCategoryCard";
import { useSearchContext } from "../context/SearchContext";

// Types
type Currency = "USD" | "INR";
export type CurrencyView = "split" | "usd" | "inr";

interface ErrorResponse {
  error: string;
}

interface ApiFilters {
  accountId?: string;
  startDate?: string;
  endDate?: string;
}

interface ChartDataPoint {
  time: string;
  [key: string]: number | string;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
  transactions: Transaction[];
}

interface ChartSeries {
  key: string;
  name: string;
  color: string;
  type: "type" | "category";
}

const InsightsDashboard: React.FC = () => {
  const { formatCurrency, convertAmount } = useSearchContext();

  // State
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyView, setCurrencyView] = useState<CurrencyView>("split");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      start:
        startDate.getFullYear() +
        "-" +
        String(startDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(startDate.getDate()).padStart(2, "0"),
      end:
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate() + 1).padStart(2, "0"),
    };
  });

  // Chart customization state
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(["income", "expense"])
  );
  const [availableSeries, setAvailableSeries] = useState<ChartSeries[]>([]);
  const [showSeriesSelector, setShowSeriesSelector] = useState<boolean>(false);

  // API call function
  const fetchInsights = useCallback(
    async (filters: ApiFilters = {}): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.accountId && filters.accountId !== "all") {
          params.append("accountId", filters.accountId);
        }

        if (filters.startDate) {
          const startTimestamp = new Date(filters.startDate)
            .getTime()
            .toString();
          params.append("startDate", startTimestamp);
        }

        if (filters.endDate) {
          const endTimestamp = new Date(filters.endDate).getTime().toString();
          params.append("endDate", endTimestamp);
        }

        const url = `/api/flow/insights${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: InsightsResponse | ErrorResponse = await response.json();

        if ("error" in result) {
          throw new Error(result.error);
        }

        if (result.success) {
          setData(result.insights);
        } else {
          throw new Error("Failed to fetch insights");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching insights:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load and filter changes
  useEffect(() => {
    const filters: ApiFilters = {
      accountId: selectedAccount !== "all" ? selectedAccount : undefined,
      startDate: dateRange.start,
      endDate: dateRange.end,
    };

    fetchInsights(filters);
  }, [fetchInsights, selectedAccount, dateRange]);

  // Update available series when data changes
  useEffect(() => {
    if (!data) return;

    const series: ChartSeries[] = [];

    // Add transaction types
    if (data.timeSeries.byType) {
      Object.keys(data.timeSeries.byType).forEach((type) => {
        const colors: { [key: string]: string } = {
          income: "#10b981",
          expense: "#ef4444",
          transfer: "#8b5cf6",
        };

        series.push({
          key: type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          color: colors[type] || "#6b7280",
          type: "type",
        });
      });
    }

    // Add categories
    if (data.timeSeries.byCategory) {
      const categoryColors = [
        "#3b82f6",
        "#f59e0b",
        "#ec4899",
        "#06b6d4",
        "#84cc16",
        "#f97316",
      ];
      Object.keys(data.timeSeries.byCategory).forEach((category, index) => {
        series.push({
          key: category,
          name: category,
          color: categoryColors[index % categoryColors.length],
          type: "category",
        });
      });
    }

    setAvailableSeries(series);
  }, [data]);

  // Format amount based on currency view
  const formatAmount = (amounts: { [currency: string]: number }): string => {
    if (currencyView === "split") {
      return (
        Object.entries(amounts)
          .filter(([, amount]) => amount > 0)
          .map(([currency, amount]) =>
            formatCurrency(amount, currency as Currency)
          )
          .join(" + ") || formatCurrency(0, "USD")
      );
    }

    const targetCurrency = currencyView.toUpperCase() as Currency;
    const totalAmount = Object.entries(amounts).reduce(
      (sum, [currency, amount]) => {
        return sum + convertAmount(amount, currency, targetCurrency);
      },
      0
    );

    return formatCurrency(totalAmount, targetCurrency);
  };

  // Format Y-axis values
  const formatYAxisValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Chart colors
  const COLORS: string[] = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  // Prepare chart data
  const prepareTimeSeriesData = (): ChartDataPoint[] => {
    if (!data?.timeSeries) return [];

    const timePoints = new Set<string>();
    const chartData: { [time: string]: ChartDataPoint } = {};

    // Collect all time points
    [...Array.from(visibleSeries)].forEach((seriesKey) => {
      const series = availableSeries.find((s) => s.key === seriesKey);
      if (!series) return;

      let seriesData: any[] = [];
      if (series.type === "type" && data.timeSeries.byType) {
        seriesData = data.timeSeries.byType[seriesKey] || [];
      } else if (series.type === "category" && data.timeSeries.byCategory) {
        seriesData = data.timeSeries.byCategory[seriesKey] || [];
      }

      seriesData.forEach((entry) => {
        timePoints.add(entry.time);
      });
    });

    // Initialize chart data
    Array.from(timePoints)
      .sort()
      .forEach((time) => {
        chartData[time] = {
          time: new Date(time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
      });

    // Populate data for each visible series
    [...Array.from(visibleSeries)].forEach((seriesKey) => {
      const series = availableSeries.find((s) => s.key === seriesKey);
      if (!series) return;

      let seriesData: any[] = [];
      if (series.type === "type" && data.timeSeries.byType) {
        seriesData = data.timeSeries.byType[seriesKey] || [];
      } else if (series.type === "category" && data.timeSeries.byCategory) {
        seriesData = data.timeSeries.byCategory[seriesKey] || [];
      }

      seriesData.forEach((entry) => {
        const targetCurrency =
          currencyView === "split"
            ? "USD"
            : (currencyView.toUpperCase() as Currency);
        const amount =
          currencyView === "split"
            ? entry.amount
            : convertAmount(entry.amount, entry.currency, targetCurrency);

        if (chartData[entry.time]) {
          chartData[entry.time][seriesKey] = amount;
        }
      });
    });

    return Object.values(chartData);
  };

  const prepareCategoryData = (): CategoryDataPoint[] => {
    if (!data?.categorySpending) return [];

    return Object.entries(data.categorySpending).map(
      ([category, categoryData], index) => {
        const { transactions, summary: amounts } = categoryData;
        const targetCurrency =
          currencyView === "split"
            ? "USD"
            : (currencyView.toUpperCase() as Currency);
        const totalAmount =
          currencyView === "split"
            ? (amounts.USD || 0) + convertAmount(amounts.INR || 0, "INR", "USD")
            : Object.entries(amounts).reduce((sum, [currency, amount]) => {
                return sum + convertAmount(amount, currency, targetCurrency);
              }, 0);

        return {
          name: category,
          value: totalAmount,
          color: COLORS[index % COLORS.length],
          transactions: transactions.map((txn) => {
            return {
              ...txn,
              amount: convertAmount(txn.amount, txn.currency, targetCurrency),
            };
          }),
        };
      }
    );
  };

  // Series toggle handlers
  const toggleSeries = (seriesKey: string): void => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(seriesKey)) {
      newVisible.delete(seriesKey);
    } else {
      newVisible.add(seriesKey);
    }
    setVisibleSeries(newVisible);
  };

  // Filter handlers
  const handleAccountChange = (value: string): void => {
    setSelectedAccount(value);
  };

  const handleDateChange = (field: "start" | "end", value: string): void => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleRefresh = (): void => {
    const filters: ApiFilters = {
      accountId: selectedAccount !== "all" ? selectedAccount : undefined,
      startDate: dateRange.start,
      endDate: dateRange.end,
    };
    fetchInsights(filters);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen text-white p-4 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-lg">Loading insights...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen text-white p-4 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Insights</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button
            onClick={handleRefresh}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen text-white p-4 flex items-center justify-center">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
          <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
          <p className="text-slate-400 mb-6">
            No insights data found for the selected filters.
          </p>
          <Button
            onClick={handleRefresh}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const timeSeriesData = prepareTimeSeriesData();
  const categoryData = prepareCategoryData();

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Insights
                </h1>
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Currency View Toggle */}
              <div className="flex rounded-xl bg-slate-800/50 p-1 backdrop-blur-sm border border-slate-700">
                <Button
                  variant={currencyView === "split" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrencyView("split")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    currencyView === "split"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  Split
                </Button>
                <Button
                  variant={currencyView === "usd" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrencyView("usd")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    currencyView === "usd"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  USD
                </Button>
                <Button
                  variant={currencyView === "inr" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrencyView("inr")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    currencyView === "inr"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  INR
                </Button>
              </div>

              {/* Account Filter */}
              <Select
                value={selectedAccount}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">All Accounts</SelectItem>
                  {data.accounts.map((account: Account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex gap-3">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Total Balance
                  </p>
                  <p className="text-2xl font-bold text-emerald-400 mt-2">
                    {formatAmount(data.totalBalance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Income</p>
                  <p className="text-2xl font-bold text-blue-400 mt-2">
                    {formatAmount(data.income)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Expenses</p>
                  <p className="text-2xl font-bold text-red-400 mt-2">
                    {formatAmount(data.expense)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">
                    Transactions
                  </p>
                  <p className="text-2xl font-bold text-purple-400 mt-2">
                    {data.transactionCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Time Series Chart */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    Financial Trends
                  </span>
                </CardTitle>
                <Button
                  onClick={() => setShowSeriesSelector(!showSeriesSelector)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Series Selector */}
              {showSeriesSelector && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                  <p className="text-sm font-medium text-slate-300 mb-3">
                    Select Data to Display:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSeries.map((series) => (
                      <Button
                        key={series.key}
                        onClick={() => toggleSeries(series.key)}
                        size="sm"
                        className={`justify-start gap-2 ${
                          visibleSeries.has(series.key)
                            ? "bg-slate-700 text-white border border-slate-600"
                            : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: series.color }}
                        />
                        {visibleSeries.has(series.key) ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {series.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4">
                {[...Array.from(visibleSeries)].map((seriesKey) => {
                  const series = availableSeries.find(
                    (s) => s.key === seriesKey
                  );
                  if (!series) return null;
                  return (
                    <div key={seriesKey} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: series.color }}
                      />
                      <span className="text-sm text-slate-300">
                        {series.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      {[...Array.from(visibleSeries)].map((seriesKey) => {
                        const series = availableSeries.find(
                          (s) => s.key === seriesKey
                        );
                        if (!series) return null;
                        return (
                          <linearGradient
                            key={seriesKey}
                            id={`gradient-${seriesKey}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={series.color}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={series.color}
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={formatYAxisValue}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      }}
                    />
                    {[...Array.from(visibleSeries)].map((seriesKey) => {
                      const series = availableSeries.find(
                        (s) => s.key === seriesKey
                      );
                      if (!series) return null;
                      return (
                        <Area
                          key={seriesKey}
                          type="monotone"
                          dataKey={seriesKey}
                          stroke={series.color}
                          strokeWidth={3}
                          fill={`url(#gradient-${seriesKey})`}
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: series.color,
                            stroke: "#1e293b",
                            strokeWidth: 2,
                          }}
                        />
                      );
                    })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Spending */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map(
                        (entry: CategoryDataPoint, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(
                          value,
                          currencyView === "inr" ? "INR" : "USD"
                        ),
                        "Amount",
                      ]}
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Balances & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Balances */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.accounts.map((account: Account) => (
                  <div
                    key={account._id}
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50"
                  >
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {account.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatAmount(data.accountBalances[account._id] || {})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((category: CategoryDataPoint, index) => (
                    <SpendingCategoryCard
                      key={index}
                      category={category}
                      currencyView={currencyView}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
