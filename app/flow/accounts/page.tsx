"use client";

import { useFlowContext } from "@/components/context/FlowContext";
import AccountsTab from "@/components/flow/AccountsTab";
import Navbar from "@/components/flow/Navbar";
import SiteLayout from "@/components/layout/SiteLayout";

export default function Page() {
  const { accounts, fetchAccounts, flowLoading } = useFlowContext();

  return (
    <SiteLayout>
      <Navbar />
      <AccountsTab
        accounts={accounts}
        onAccountsChange={fetchAccounts}
        isLoading={flowLoading}
      />
    </SiteLayout>
  );
}
