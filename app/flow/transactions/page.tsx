"use client";

import { useFlowContext } from "@/components/context/FlowContext";
import Navbar from "@/components/flow/Navbar";
import TransactionsTab from "@/components/flow/TransactionsTab";
import SiteLayout from "@/components/layout/SiteLayout";

export default function Page() {
  const { transactions, fetchTransactions, flowLoading } = useFlowContext();

  return (
    <SiteLayout>
      <Navbar />
      <TransactionsTab
        transactions={transactions}
        onTransactionsChange={fetchTransactions}
        isLoading={flowLoading}
      />
    </SiteLayout>
  );
}
