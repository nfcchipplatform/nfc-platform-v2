// src/app/api/following/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // フォロー中一覧を取得（自分がフォローしている人）
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            title: true,
          }
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // フォロー中数を取得
    const followingCount = await prisma.follow.count({
      where: { followerId: userId },
    });

    // 扱いやすい形に変換
    const followingList = following.map(f => ({
      ...f.following,
      followedAt: f.createdAt,
    }));

    return NextResponse.json({ 
      following: followingList,
      count: followingCount,
    });

  } catch (error) {
    console.error("GET_FOLLOWING_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
