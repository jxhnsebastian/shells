"use client";

import SiteLayout from "@/components/layout/SiteLayout";
import { SearchProvider } from "@/components/context/SearchContext";
import SearchPage from "@/components/pages/SearchPage";

export default function Page() {
  return (
    <SiteLayout>
      <SearchProvider>
        <SearchPage />
      </SearchProvider>
    </SiteLayout>
  );
}
