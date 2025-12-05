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

    // --- 1. フォロー中リスト (全件) を取得 ---
    const rawFollowing = await prisma.follow.findMany({
        where: { followerId: ownerId },
        select: {
            following: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                    title: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    // 扱いやすい形に変換
    const followingList = rawFollowing.map(f => f.following);

    // --- 2. トップ5選抜リスト (Favorite) を取得 ---
    const favorites = await prisma.favorite.findMany({
      where: { ownerId: ownerId },
      select: {
          slotIndex: true,
          selectedUser: {
              select: {
                  id: true,
                  username: true,
                  name: true,
                  image: true,
                  title: true,
              }
          }
      },
      orderBy: { slotIndex: 'asc' },
    });

    // 5つのスロットの配列を準備 (空の部分はnull)
    const top5Slots = Array(5).fill(null);
    favorites.forEach(fav => {
      if (fav.slotIndex >= 0 && fav.slotIndex < 5 && fav.selectedUser) {
        top5Slots[fav.slotIndex] = fav.selectedUser;
      }
    });

    // 両方のデータを返す
    return NextResponse.json({ 
        followingList, 
        top5Slots 
    });

  } catch (error) {
    console.error("GET_FAVORITES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}