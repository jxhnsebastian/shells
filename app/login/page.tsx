"use client";

import { Suspense } from "react";
import { Loader } from "lucide-react";
import LoginPage from "../../components/pages/LoginPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-1">
          loading movies
          <Loader className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
