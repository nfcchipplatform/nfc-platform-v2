"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// サロン設定の更新
export async function updateSalonSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // 権限チェック
  if (!user || (user.role !== "SALON_ADMIN" && user.role !== "SUPER_ADMIN")) {
    return { error: "権限がありません" };
  }
  if (!user.salonId) {
    return { error: "管理対象の店舗がありません" };
  }

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const mapUrl = formData.get("mapUrl") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const primaryColor = formData.get("primaryColor") as string;
  const accentColor = formData.get("accentColor") as string;
  const logoUrl = formData.get("logoUrl") as string;

  try {
    await prisma.salon.update({
      where: { id: user.salonId },
      data: {
        name,
        location,
        mapUrl,
        websiteUrl,
        primaryColor,
        accentColor,
        logoUrl: logoUrl || null, // 空文字ならnullにする
      },
    });

    revalidatePath("/dashboard/salon/settings");
    return { success: true, message: "店舗設定を保存しました" };
  } catch (e) {
    console.error(e);
    return { error: "保存に失敗しました" };
  }
}