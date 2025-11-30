"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function updateFavorites(slots: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("認証されていません");
    }
    const ownerId = session.user.id;

    await prisma.$transaction(async (tx) => {
      await tx.favorite.deleteMany({ where: { ownerId } });
      const newFavorites = slots
        .map((url, index) => ({ ownerId, slotIndex: index, url }))
        .filter(fav => fav.url.trim() !== '');
      if (newFavorites.length > 0) {
        await tx.favorite.createMany({ data: newFavorites });
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "設定の保存に失敗しました。" };
  }
}
