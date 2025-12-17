import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerList from "./CustomerList";

const prisma = new PrismaClient();

export default async function SalonCustomersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // 権限チェック
  if (!user || (user.role !== "SALON_ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/dashboard");
  }
  if (!user.salonId) {
    return <div>店舗情報がありません</div>;
  }
  // 自店舗の顧客のみ取得
  const customers = await prisma.user.findMany({
    where: { salonId: user.salonId },
    orderBy: { createdAt: "desc" },
    select: {
        id: true,
        name: true,
        username: true,
        email: true,
        nfcCardId: true,
        image: true
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">顧客管理</h1>
      <p className="text-sm text-gray-500">
          あなたの店舗 ({user.salonId}) に所属しているユーザーの一覧です。
      </p>
      
      <CustomerList customers={customers} />
    </div>
  );
}