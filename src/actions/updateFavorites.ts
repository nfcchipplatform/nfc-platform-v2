// src/actions/updateFavorites.ts

"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateFavorites(userIds: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("認証されていません");
    }
    const ownerId = session.user.id;

    // userIdsの長さを最大5に制限
    const selectedUserIds = userIds.slice(0, 5);

    await prisma.$transaction(async (tx) => {
      // 既存のトップ5リストを全て削除
      await tx.favorite.deleteMany({ where: { ownerId } });
      
      // 新しいトップ5リストを作成
      // 有効なIDだけをフィルタリングして保存
      const newFavorites = selectedUserIds
        .filter(userId => userId.trim() !== '')
        .map((selectedUserId, index) => ({ 
            ownerId, 
            slotIndex: index, 
            selectedUserId
        }));

      if (newFavorites.length > 0) {
        await tx.favorite.createMany({ data: newFavorites });
      }
    });

    // ダッシュボードのキャッシュをクリア
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error("UPDATE_FAVORITES_ERROR", error);
    return { success: false, error: "設定の保存に失敗しました。" };
  }
}