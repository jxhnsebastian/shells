"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut,
  User,
  Bookmark,
  Check,
  Search,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 contrast rounded px-2 cursor-pointer">
        <span>{user?.name || "User"}</span>
        <User size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="anti-contrast mr-3.5">
        <DropdownMenuItem className="p-0.5 rounded">
          <Link href="/user/watchlist" className="flex items-center gap-2">
            <Bookmark size={16} />
            <span>watchlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0.5 rounded">
          <Link href="/user/watched" className="flex items-center gap-2">
            <Check size={16} />
            <span>watched</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0.5 rounded">
          <Link href="/search" className="flex items-center gap-2">
            <Search size={16} />
            <span>search</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0.5 rounded">
          <Link href="/flow" className="flex items-center gap-2">
            <DollarSign size={16} />
            <span>flow</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="flex items-center gap-2 p-0.5 rounded"
        >
          <LogOut size={16} />
          <span>logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
