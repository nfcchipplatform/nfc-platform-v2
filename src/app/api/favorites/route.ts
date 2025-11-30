// src/app/api/favorites/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ★ここが修正ポイント
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FavoriteProfile {
    username: string | null;
    name: string | null;
    image: string | null;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { ownerId: session.user.id },
      orderBy: { slotIndex: 'asc' },
    });

    const slots = Array(5).fill('');
    favorites.forEach(fav => {
      if (fav.slotIndex >= 0 && fav.slotIndex < 5) {
        slots[fav.slotIndex] = fav.url;
      }
    });

    const usernames = slots.filter(slot => slot && !slot.startsWith('http'));

    let profiles: FavoriteProfile[] = [];
    if (usernames.length > 0) {
      profiles = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { username: true, name: true, image: true },
      });
    }

    return NextResponse.json({ slots, profiles });

  } catch (error) {
    console.error("GET_FAVORITES_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}