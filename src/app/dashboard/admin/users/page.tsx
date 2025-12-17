// src/app/dashboard/admin/users/page.tsx

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserTable from "./UserTable";

const prisma = new PrismaClient();

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);

  // 権限チェック
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // 検索クエリ
  const query = searchParams.q || "";

  // ユーザー検索 & 取得
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      salon: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 店舗リスト取得（プルダウン用）
  const salons = await prisma.salon.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">全ユーザー管理</h1>
      </div>

      {/* 検索バー */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <form method="get" className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            placeholder="名前、ID、メールで検索..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold hover:bg-black">
            検索
          </button>
        </form>
      </div>

      {/* ユーザー一覧テーブル (Client Component) */}
      <UserTable users={users as any} salons={salons} />
      
      <p className="text-right text-xs text-gray-400">
          全 {users.length} 件のユーザーを表示中
      </p>
    </div>
  );
}