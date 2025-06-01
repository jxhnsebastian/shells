"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountsTab from "@/components/flow/AccountsTab";
import TransactionsTab from "@/components/flow/TransactionsTab";
import InsightsTab from "@/components/flow/InsightsTab";
import { Account, Transaction } from "@/lib/flow-types";

export default function FlowPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/flow/accounts");
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/flow/transactions");
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchAccounts(), fetchTransactions()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">flow</h1>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">accounts</TabsTrigger>
          <TabsTrigger value="transactions">transactions</TabsTrigger>
          <TabsTrigger value="insights">insights</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <AccountsTab
            accounts={accounts}
            onAccountsChange={fetchAccounts}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab
            transactions={transactions}
            accounts={accounts}
            onTransactionsChange={fetchTransactions}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsTab isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
