// src/actions/followActions.ts

"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

/**
 * ユーザーをフォローします。
 */
export async function followUser(followingId: string) {
  const session = await getServerSession(authOptions);
  const followerId = session?.user?.id;

  if (!followerId) {
    return { success: false, error: "認証されていません。" };
  }

  if (followerId === followingId) {
    return { success: false, error: "自分自身をフォローすることはできません。" };
  }

  try {
    // 既存のフォロー関係を確認
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return { success: true, message: "既にフォローしています。" };
    }

    // フォロー作成
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // キャッシュ更新（相手のプロフィール、自分のダッシュボード）
    const followingUser = await prisma.user.findUnique({ where: { id: followingId }, select: { username: true } });
    if (followingUser?.username) {
        revalidatePath(`/${followingUser.username}`);
    }
    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/favorites`);
    
    return { success: true, message: "フォローしました。" };
  } catch (error) {
    console.error("FOLLOW_ERROR", error);
    return { success: false, error: "フォロー処理に失敗しました。" };
  }
}

/**
 * ユーザーのフォローを解除します。
 */
export async function unfollowUser(followingId: string) {
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.id;

    if (!followerId) {
        return { success: false, error: "認証されていません。" };
    }

    try {
        const result = await prisma.follow.deleteMany({
            where: {
                followerId: followerId,
                followingId: followingId,
            },
        });
        
        // フォロー解除したら、トップ5設定からも削除しておく
        if (result.count > 0) {
            await prisma.favorite.deleteMany({
                where: {
                    ownerId: followerId,
                    selectedUserId: followingId,
                }
            });
        }
        
        // キャッシュ更新
        const followingUser = await prisma.user.findUnique({ where: { id: followingId }, select: { username: true } });
        if (followingUser?.username) {
            revalidatePath(`/${followingUser.username}`);
        }
        revalidatePath(`/dashboard`);
        revalidatePath(`/dashboard/favorites`);

        return { success: true, message: "フォローを解除しました。" };
    } catch (error) {
        console.error("UNFOLLOW_ERROR", error);
        return { success: false, error: "フォロー解除処理に失敗しました。" };
    }
}

/**
 * フォロー状態を確認します。
 */
export async function checkIsFollowing(targetUserId: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    const followerId = session?.user?.id;

    if (!followerId) return false;
    // 自分自身はフォローできないのでfalse
    if (followerId === targetUserId) return false;

    try {
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: targetUserId,
                },
            },
        });

        return !!existingFollow;
    } catch (error) {
        console.error("CHECK_FOLLOW_ERROR", error);
        return false;
    }
}