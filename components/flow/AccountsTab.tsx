"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Wallet,
  CreditCard,
  Bitcoin,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Account } from "@/lib/flow-types";
import AccountDialog from "./AccountDialog";
import { useSearchContext } from "../context/SearchContext";

interface AccountsTabProps {
  accounts: Account[];
  onAccountsChange: () => void;
  isLoading: boolean;
}

const accountTypeIcons = {
  bank: Building,
  crypto_wallet: Bitcoin,
  crypto_card: CreditCard,
  other: Wallet,
};

const accountTypeLabels = {
  bank: "Bank Account",
  crypto_wallet: "Crypto Wallet",
  crypto_card: "Crypto Card",
  other: "Other",
};

export default function AccountsTab({
  accounts,
  onAccountsChange,
  isLoading,
}: AccountsTabProps) {
  const { formatCurrency } = useSearchContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const response = await fetch(`/api/flow/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onAccountsChange();
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading accounts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">your accounts</h2>
        <Button onClick={handleCreateAccount} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          add account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">no accounts yet</p>
            <Button onClick={handleCreateAccount} className="mt-4">
              create your first account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const IconComponent = accountTypeIcons[account.type];
            return (
              <Card key={account._id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      <CardTitle className="text-base">
                        {account.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {accountTypeLabels[account.type]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    {account.description && (
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        account={editingAccount}
        onSuccess={onAccountsChange}
      />
    </div>
  );
}
