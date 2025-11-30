// src/app/dashboard/page.tsx (元のコードに戻す)

import DashboardClient from "@/components/DashboardClient";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-800">ダッシュボード</h1>
      <DashboardClient />
    </div>
  );
}