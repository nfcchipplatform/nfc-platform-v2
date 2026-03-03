// src/app/api/favorites/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = session?.user?.id;

    if (!ownerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // --- 1. オーナー情報を取得 ---
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        title: true,
        nfcCardId: true,
      },
    });

    // --- 2. トップ5選抜リスト (Favorite) を取得 ---
    const favorites = await prisma.favorite.findMany({
      where: { ownerId: ownerId, slotIndex: { gte: 1, lte: 4 } },
      select: {
          slotIndex: true,
          selectedUser: {
              select: {
                  id: true,
                  username: true,
                  name: true,
                  image: true,
                  title: true,
                  nfcCardId: true,
              }
          }
      },
      orderBy: { slotIndex: 'asc' },
    });

    // 5つのスロットの配列を準備 (空の部分はnull)
    const top5Slots = Array(5).fill(null);
    if (owner) {
      top5Slots[0] = owner;
    }
    favorites.forEach(fav => {
      if (fav.slotIndex >= 1 && fav.slotIndex <= 4 && fav.selectedUser) {
        top5Slots[fav.slotIndex] = fav.selectedUser;
      }
    });

    // データを返す
    return NextResponse.json({ 
        top5Slots 
    });

  } catch (error) {
    console.error("GET_FAVORITES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}