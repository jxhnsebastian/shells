"use client";

import { useAuth } from "@/hooks/useAuth";
import { Account, Transaction } from "@/lib/flow-types";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Filters {
  accountId?: string;
  type?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface FlowContextProps {
  accounts: Account[];
  setAccounts: (value: Account[]) => void;
  transactions: Transaction[];
  setTransactions: (value: Transaction[]) => void;
  flowLoading: boolean;
  setFlowLoading: (value: boolean) => void;
  pagination: PaginationInfo;
  setPagination: (value: PaginationInfo) => void;

  fetchTransactions: (
    page?: number,
    limit?: number,
    newFilters?: Filters
  ) => Promise<void>;
  fetchAccounts: () => Promise<void>;
}

const FlowContext = createContext<FlowContextProps | undefined>(undefined);

interface FlowProviderProps {
  children: ReactNode;
}

export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setAccounts([]);
      setTransactions([]);
    }
  }, [isAuthenticated]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [flowLoading, setFlowLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const fetchAccounts = async () => {
    try {
      setFlowLoading(true);
      const response = await fetch("/api/flow/accounts");
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
      setFlowLoading(false);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchTransactions = async (
    page: number = 1,
    limit: number = 20,
    newFilters?: Filters
  ) => {
    try {
      setFlowLoading(true);
      const currentFilters = newFilters || {};

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (currentFilters.accountId)
        params.append("accountId", currentFilters.accountId);
      if (currentFilters.type) params.append("type", currentFilters.type);
      if (currentFilters.category)
        params.append("category", currentFilters.category);
      if (currentFilters.startDate)
        params.append("startDate", currentFilters.startDate.toISOString());
      if (currentFilters.endDate)
        params.append("endDate", currentFilters.endDate.toISOString());

      const response = await fetch(`/api/flow/transactions?${params}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      }
      setFlowLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setFlowLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setFlowLoading(true);
      await Promise.all([fetchAccounts(), fetchTransactions()]);
      setFlowLoading(false);
    };
    loadData();
  }, []);

  return (
    <FlowContext.Provider
      value={{
        accounts,
        setAccounts,
        transactions,
        setTransactions,
        flowLoading,
        setFlowLoading,
        pagination,
        setPagination,
        fetchAccounts,
        fetchTransactions,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlowContext = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlowContext must be used within a FlowProvider");
  }
  return context;
};
