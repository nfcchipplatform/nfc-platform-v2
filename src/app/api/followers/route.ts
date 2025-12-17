// src/app/api/followers/route.ts

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

    // フォロワー一覧を取得（自分をフォローしている人）
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
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

    // フォロワー数を取得
    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    });

    // 自分がフォローしているユーザーIDのセットを取得（相互フォロー判定用）
    const followingIds = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIdSet = new Set(followingIds.map(f => f.followingId));

    // 扱いやすい形に変換（相互フォロー情報を含める）
    const followersList = followers.map(f => ({
      ...f.follower,
      followedAt: f.createdAt,
      isFollowing: followingIdSet.has(f.follower.id), // 自分がそのフォロワーをフォローしているか
    }));

    return NextResponse.json({ 
      followers: followersList,
      count: followerCount,
    });

  } catch (error) {
    console.error("GET_FOLLOWERS_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
