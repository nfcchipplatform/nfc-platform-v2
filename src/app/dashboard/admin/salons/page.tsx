// src/app/dashboard/admin/salons/page.tsx

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SalonRow from "./SalonRow";

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

// 店舗更新アクション
async function updateSalon(formData: FormData) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    return;
  }
  
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const salonCode = formData.get("salonCode") as string;
  const location = formData.get("location") as string;

  if (!id || !name || !slug || !salonCode) return;

  try {
      await prisma.salon.update({
          where: { id },
          data: { name, slug, salonCode, location: location || null }
      });
      revalidatePath('/dashboard/admin/salons');
  } catch (e) {
      console.error(e);
  }
}

// 店舗削除アクション
async function deleteSalon(formData: FormData) {
  "use server";
  
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    return;
  }
  
  const id = formData.get("id") as string;
  if (!id) return;

  try {
      await prisma.salon.delete({
          where: { id }
      });
      revalidatePath('/dashboard/admin/salons');
  } catch (e) {
      console.error(e);
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
        <h1 className="text-2xl font-bold text-gray-800">全店舗管理</h1>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {salons.map((salon) => (
                      <SalonRow key={salon.id} salon={salon} updateSalon={updateSalon} deleteSalon={deleteSalon} />
                  ))}
              </tbody>
          </table>
          {salons.length === 0 && <div className="p-8 text-center text-gray-400">店舗がまだありません</div>}
      </div>
    </div>
  );
}