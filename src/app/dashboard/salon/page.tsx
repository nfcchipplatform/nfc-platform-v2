import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';

const prisma = new PrismaClient();

export default async function SalonDashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // 権限チェック
  if (!user || (user.role !== "SALON_ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }
  if (!user.salonId) {
    return <div className="p-8">管理対象の店舗が設定されていません。</div>;
  }

  // サロン情報取得
  const salon = await prisma.salon.findUnique({
    where: { id: user.salonId },
    include: {
        _count: { select: { users: true } }
    }
  });

  if (!salon) return <div>店舗データが見つかりません</div>;

  const registerUrl = `https://app.ponnu.net/register?salonCode=${salon.salonCode}`;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">🏠 店舗管理ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 店舗情報カード */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded bg-gray-900 text-white flex items-center justify-center font-bold text-xl">
                    {salon.name[0]}
                </div>
                <div>
                    <h2 className="text-xl font-bold">{salon.name}</h2>
                    <p className="text-gray-500 text-sm">{salon.location}</p>
                </div>
            </div>
            <div className="flex gap-4 text-sm">
                <div className="bg-gray-50 px-3 py-2 rounded">
                    <span className="block text-xs text-gray-400 font-bold">店舗コード</span>
                    <span className="font-mono text-lg font-bold">{salon.salonCode}</span>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded">
                    <span className="block text-xs text-gray-400 font-bold">顧客数</span>
                    <span className="font-mono text-lg font-bold">{salon._count.users} 名</span>
                </div>
            </div>
        </div>

        {/* 新規顧客登録用QRコード */}
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col items-center text-center">
            <h3 className="font-bold text-indigo-900 mb-2">新規顧客登録用QR</h3>
            <p className="text-xs text-indigo-700 mb-4">
                このQRコードを読み取ると<br/>
                自動的に「{salon.name}」に紐付いて登録されます。
            </p>
            <div className="bg-white p-3 rounded shadow-sm">
                <QRCodeSVG value={registerUrl} size={120} />
            </div>
            <div className="mt-4 w-full">
                <p className="text-[10px] text-gray-400 mb-1 text-left">URL:</p>
                <code className="block bg-white px-2 py-1 rounded border text-xs text-gray-500 break-all select-all cursor-pointer">
                    {registerUrl}
                </code>
            </div>
        </div>
      </div>
    </div>
  );
}