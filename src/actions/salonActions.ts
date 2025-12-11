"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { reset } from "@/actions/reset"; // 既存のリセット処理を再利用

const prisma = new PrismaClient();

// 店舗管理者権限チェック & サロンID取得
async function getSalonSession() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  // SUPER_ADMIN は全ての店舗にアクセス可能だが、今回は簡易化のため SALON_ADMIN チェックを優先
  // ※ もしスーパー管理者がこの画面を見る場合は、別途ロジックが必要（今回は「自分のサロン」を見る前提）
  if (!user || (user.role !== "SALON_ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("権限がありません");
  }
  
  // ユーザーに紐付いている salonId (自分が管理しているサロン) を返す
  // ※ SUPER_ADMINの場合は、別途指定が必要だが、ここでは「SALON_ADMINとしてログインしている」想定
  if (!user.salonId) {
    throw new Error("管理対象の店舗が割り当てられていません");
  }

  return { session, salonId: user.salonId };
}

// 顧客のNFC紐付け解除 (店舗管理者用)
export async function salonUnlinkNfc(targetUserId: string) {
  try {
    const { salonId } = await getSalonSession();

    // ターゲットが本当に自分の店舗の顧客か確認（セキュリティ）
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (targetUser?.salonId !== salonId) {
      return { success: false, error: "自店舗の顧客ではありません" };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { nfcCardId: null },
    });

    revalidatePath("/dashboard/salon/customers");
    return { success: true, message: "NFC連携を解除しました" };

  } catch (e) {
    console.error(e);
    return { success: false, error: "解除に失敗しました" };
  }
}

// パスワードリセットメールの代理送信
export async function sendResetMailByAdmin(email: string) {
  try {
    // 権限チェックだけ行う
    await getSalonSession();
    
    // 既存の reset アクションを呼び出す
    const result = await reset(email);
    return result;

  } catch (e) {
    return { error: "送信に失敗しました" };
  }
}