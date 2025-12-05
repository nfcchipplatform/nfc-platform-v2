// src/actions/linkNfcCard.ts

"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. カードを紐付ける機能
export async function linkNfcCard(userId: string, cardId: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.id !== userId) {
    return { success: false, error: "認証エラー: 権限がありません。" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { nfcCardId: cardId },
    });

    if (existingUser) {
        if (existingUser.id === userId) {
            return { success: true, message: "既にこのカードはあなたに紐付いています。" };
        }
        return { success: false, error: "このNFCカードは既に他のユーザーに登録されています。" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { nfcCardId: cardId },
    });

    revalidatePath("/dashboard");
    return { success: true, message: "NFCカードを紐付けました！" };

  } catch (error) {
    console.error("LINK_CARD_ERROR", error);
    return { success: false, error: "NFCカードの紐付けに失敗しました。" };
  }
}

// 2. 現在のカードIDを取得する機能 (これが足りていませんでした！)
export async function getNfcCardId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { nfcCardId: true }
        });
        return user?.nfcCardId || null;
    } catch (error) {
        return null;
    }
}