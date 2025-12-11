// src/app/dashboard/admin/salons/page.tsx

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 新規店舗作成アクション
async function createSalon(formData: FormData) {
  "use server";
  
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const salonCode = formData.get("salonCode") as string;
  const location = formData.get("location") as string;

  if (!name || !slug || !salonCode) return;

  try {
      await prisma.salon.create({
          data: { name, slug, salonCode, location }
      });
      revalidatePath('/dashboard/admin/salons');
  } catch (e) {
      console.error(e);
      // エラーハンドリングは簡易的に
  }
}

export default async function AdminSalonsPage() {
  const session = await getServerSession(authOptions);
  
  // 権限チェック: SUPER_ADMIN以外は追い出す
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      redirect('/dashboard');
  }

  // 全店舗取得
  const salons = await prisma.salon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
          _count: { select: { users: true } } 
      }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">🏢 全店舗管理</h1>
      </div>

      {/* 新規作成フォーム */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-lg mb-4 text-gray-700">新規店舗登録</h2>
          <form action={createSalon} className="flex flex-wrap gap-4 items-end">
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">店舗名</label>
                  <input name="name" type="text" placeholder="例: サロン東京" className="border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">ID (Slug)</label>
                  <input name="slug" type="text" placeholder="例: salon-tokyo" className="border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">店舗コード</label>
                  <input name="salonCode" type="text" placeholder="例: 1001" className="border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">地域</label>
                  <input name="location" type="text" placeholder="例: 東京都新宿区" className="border rounded px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="bg-gray-900 text-white font-bold px-4 py-2 rounded text-sm hover:bg-black transition-colors">
                  作成する
              </button>
          </form>
      </div>

      {/* 一覧表示 */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">店舗名 / 地域</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コード / ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {salons.map((salon) => (
                      <tr key={salon.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{salon.name}</div>
                              <div className="text-xs text-gray-500">{salon.location || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded">{salon.salonCode}</div>
                              <div className="text-xs text-gray-500 mt-1">{salon.slug}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {salon._count.users} 名
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(salon.createdAt).toLocaleDateString()}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {salons.length === 0 && <div className="p-8 text-center text-gray-400">店舗がまだありません</div>}
      </div>
    </div>
  );
}