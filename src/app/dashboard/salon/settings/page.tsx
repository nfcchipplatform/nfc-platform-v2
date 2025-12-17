import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SalonSettingsForm from "./SalonSettingsForm";

const prisma = new PrismaClient();

export default async function SalonSettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user?.salonId) return <div className="p-8">店舗情報がありません</div>;

  const salon = await prisma.salon.findUnique({
    where: { id: user.salonId },
  });

  if (!salon) return <div className="p-8">データ読み込みエラー</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">店舗設定 & UIカスタマイズ</h1>
      <SalonSettingsForm salon={salon} />
    </div>
  );
}