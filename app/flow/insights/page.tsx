"use client";

import InsightsTab from "@/components/flow/InsightsTab";
import Navbar from "@/components/flow/Navbar";
import SiteLayout from "@/components/layout/SiteLayout";

export default function Page() {
  return (
    <SiteLayout>
      <Navbar />
      <InsightsTab />
    </SiteLayout>
  );
}
