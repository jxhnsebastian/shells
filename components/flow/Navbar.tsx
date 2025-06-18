"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  if (!session) {
    return (
      <nav className="border-b bg-card/80 backdrop-blur-sm  top-0 z-50">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/flow" className="text-xl sm:text-2xl font-bold">
            flow
          </Link>

          <Button onClick={() => signIn("google")}>sign in</Button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm  top-0 z-50 mb-4 sm:mb-6">
      <div className="container mx-auto px-0 sm:px-0 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 sm:space-y-4 md:space-y-0">
          <div className="flex justify-between items-center px-1 sm:px-2 md:px-0">
            <Link href="/flow" className="text-xl sm:text-2xl font-bold">
              flow
            </Link>

            {/* Mobile Currency Selector */}
            <div className="md:hidden">
              <CurrencySelector isMobile />
            </div>
          </div>

          <Nav />

          {/* Desktop Currency Selector */}
          <div className="hidden md:flex">
            <CurrencySelector />
          </div>
        </div>
      </div>
    </nav>
  );
}

const Nav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/flow", icon: Home, label: "Home", shortLabel: "Home" },
    {
      href: "/flow/accounts",
      icon: CreditCard,
      label: "Accounts",
      shortLabel: "Acc",
    },
    {
      href: "/flow/transactions",
      icon: Receipt,
      label: "Transactions",
      shortLabel: "Trans",
    },
    {
      href: "/flow/insights",
      icon: BarChart3,
      label: "Insights",
      shortLabel: "Stats",
    },
  ];

  return (
    <div className="flex justify-between md:justify-center md:space-x-8 bg-muted/30 rounded-xl p-1.5 sm:p-2 md:bg-transparent md:p-0">
      {navItems.map(({ href, icon: Icon, label, shortLabel }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`
              flex flex-col md:flex-row items-center justify-center md:space-x-2 
              px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-4 md:py-2 rounded-lg
              text-xs md:text-sm font-medium 
              transition-all duration-200 
              hover:scale-105 hover:bg-primary/10
              min-w-[3rem] sm:min-w-[3.5rem] md:min-w-fit
              ${
                isActive
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-primary"
              }
            `}
          >
            <Icon
              className={`h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 ${
                isActive ? "text-primary" : ""
              }`}
            />
            <span className="mt-0.5 sm:mt-1 md:mt-0 text-[10px] sm:text-xs md:text-sm leading-tight">
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline md:inline">{label}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
};

const CurrencySelector = ({ isMobile = false }: { isMobile?: boolean }) => {
  const [preferredCurrency, setPreferredCurrency] = useState<string>("USD");

  return (
    <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
      <SelectTrigger
        className={`
        ${isMobile ? "w-14 h-8 text-xs" : "w-20 md:w-24 h-9"} 
        border-muted-foreground/20 hover:border-primary/40 transition-colors duration-200 
        focus:ring-2 focus:ring-primary/20
      `}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="backdrop-blur-sm bg-card/95">
        {CURRENCIES.map((currency) => (
          <SelectItem
            key={currency}
            value={currency}
            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors duration-150"
          >
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
