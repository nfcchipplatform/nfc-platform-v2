// src/actions/updateFavorites.ts

"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateFavorites(inputs: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("認証されていません");
    }
    const ownerId = session.user.id;

    // 入力は最大5つまで
    const rawInputs = inputs.slice(0, 5);
    const validFavorites: { ownerId: string; slotIndex: number; selectedUserId: string }[] = [];
    const notFoundInputs: string[] = [];

    // すべての入力値を検証
    for (let i = 0; i < rawInputs.length; i++) {
      const input = rawInputs[i].trim();
      
      // 空欄はスキップ（エラーにはしない）
      if (!input) continue;

      // 1. まずIDとして検索
      let targetUser = await prisma.user.findUnique({
        where: { id: input },
      });

      // 2. IDで見つからなければ、ユーザー名(username)として検索
      if (!targetUser) {
        targetUser = await prisma.user.findUnique({
          where: { username: input },
        });
      }

      if (targetUser) {
        // ユーザーが見つかった場合
        validFavorites.push({
          ownerId,
          slotIndex: i,
          selectedUserId: targetUser.id,
        });
      } else {
        // 見つからなかった場合、リストに記録
        notFoundInputs.push(input);
      }
    }

    // もし存在しないユーザーが一つでもあれば、保存せずにエラーを返す
    if (notFoundInputs.length > 0) {
      return { 
        success: false, 
        error: `次のユーザーが見つかりませんでした: ${notFoundInputs.join(", ")}` 
      };
    }

    // 全て有効な場合のみ保存を実行
    await prisma.$transaction(async (tx) => {
      // 既存の設定を削除
      await tx.favorite.deleteMany({ where: { ownerId } });
      
      // 新しい設定を保存
      if (validFavorites.length > 0) {
        await tx.favorite.createMany({ data: validFavorites });
      }
    });

    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error("UPDATE_FAVORITES_ERROR", error);
    return { success: false, error: "設定の保存に失敗しました。" };
  }
}