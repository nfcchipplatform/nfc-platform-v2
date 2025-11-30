// src/app/dashboard/page.tsx

"use client";

import { Suspense } from "react";
import DashboardClient from "@/components/DashboardClient";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-800">ダッシュボード</h1>
      <Suspense fallback={<div className="p-10 text-center">読み込み中...</div>}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}