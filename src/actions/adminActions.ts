"use server";

import { PrismaClient, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 権限チェック用ヘルパー
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "SUPER_ADMIN") {
    throw new Error("権限がありません");
  }
  return session;
}

// ユーザー権限の変更
export async function updateUserRole(userId: string, newRole: Role) {
  try {
    await requireSuperAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "権限を更新しました" };
  } catch (e) {
    return { success: false, error: "更新に失敗しました" };
  }
}

// 所属店舗の変更
export async function updateUserSalon(userId: string, salonId: string | null) {
  try {
    await requireSuperAdmin();
    // salonIdが "null" という文字列で来る場合の対応
    const targetSalonId = salonId === "null" || salonId === "" ? null : salonId;
    
    await prisma.user.update({
      where: { id: userId },
      data: { salonId: targetSalonId },
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "所属店舗を更新しました" };
  } catch (e) {
    return { success: false, error: "更新に失敗しました" };
  }
}

// NFCカードの強制解除
export async function adminUnlinkNfc(userId: string) {
  try {
    await requireSuperAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { nfcCardId: null },
    });
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "NFC連携を解除しました" };
  } catch (e) {
    return { success: false, error: "解除に失敗しました" };
  }
}

// ユーザー削除
export async function deleteUser(userId: string) {
  try {
    const session = await requireSuperAdmin();
    // 自分自身は削除できない
    if (session?.user?.id === userId) {
        return { success: false, error: "自分自身は削除できません" };
    }

    // 関連データの削除 (Favoriteの制約回避のため)
    // 1. このユーザーが誰かを登録しているデータを削除
    await prisma.favorite.deleteMany({ where: { ownerId: userId } });
    // 2. このユーザーが誰かに登録されているデータを削除
    await prisma.favorite.deleteMany({ where: { selectedUserId: userId } });
    
    // ユーザー削除
    await prisma.user.delete({
      where: { id: userId },
    });
    
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "ユーザーを削除しました" };
  } catch (e) {
    console.error(e);
    return { success: false, error: "削除に失敗しました" };
  }
}