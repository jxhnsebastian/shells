"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/lib/flow-types";
import { Home, CreditCard, Receipt, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [preferredCurrency, setPreferredCurrency] = useState<string>("");

  if (!session) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/flow" className="text-2xl font-bold">
            flow
          </Link>

          <Button onClick={() => signIn("google")}>sign in</Button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-card mb-4">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/flow" className="text-2xl font-bold">
          flow
        </Link>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex space-x-4">
            <Link
              href="/flow"
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/flow/accounts"
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
            >
              <CreditCard className="h-4 w-4" />
              <span>Accounts</span>
            </Link>
            <Link
              href="/flow/transactions"
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
            >
              <Receipt className="h-4 w-4" />
              <span>Transactions</span>
            </Link>
            <Link
              href="/flow/insights"
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Insights</span>
            </Link>
          </div>

          <Select
            value={preferredCurrency}
            onValueChange={setPreferredCurrency}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </nav>
  );
}
