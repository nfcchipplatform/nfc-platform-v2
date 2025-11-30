"use server";

import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

/**
 * プロフィール閲覧イベントをデータベースに記録します。
 * @param profileOwnerId 閲覧されたユーザーのID
 */
export async function trackProfileView(profileOwnerId: string) {
  try {
    // 閲覧したユーザーのIPアドレスを取得
    // NOTE: 実際の運用環境では、ロードバランサやプロキシの設定に応じて
    // 'x-forwarded-for' などのヘッダーを確認する必要がある場合があります。
    const forwardedFor = headers().get('x-forwarded-for');
    // x-forwarded-for がある場合はカンマ区切りの最初のIPを、なければ x-real-ip を、どちらもなければ 'Unknown' を使用
    const viewerIp = forwardedFor ? forwardedFor.split(',')[0].trim() : headers().get('x-real-ip') || 'Unknown';
    
    // 過去1時間以内に同じIPアドレスからの閲覧記録があるかチェック（簡易的な重複防止）
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); 

    const recentView = await prisma.profileView.findFirst({
        where: {
            profileOwnerId,
            viewerIp,
            viewedAt: {
                gte: oneHourAgo, // 1時間前よりも新しい（gte）記録を探す
            },
        },
    });

    if (recentView) {
        // 過去1時間以内に閲覧済みのため、記録をスキップ
        return { success: true, message: "View skipped due to recent visit from same IP." };
    }

    // 新しい閲覧記録を作成
    await prisma.profileView.create({
      data: {
        profileOwnerId,
        viewerIp, // 取得したIPアドレスを記録
      },
    });

    return { success: true };
  } catch (error) {
    console.error("TRACK_VIEW_ERROR", error);
    // エラーが発生しても、プロフィール表示自体はブロックしない
    return { success: false, error: "Failed to track view." };
  }
}

/**
 * 特定のユーザーの総閲覧数を取得します。
 * @param profileOwnerId ユーザーID
 */
export async function getProfileViewCount(profileOwnerId: string) {
    try {
        const count = await prisma.profileView.count({
            where: {
                profileOwnerId: profileOwnerId,
            },
        });
        return { success: true, count };
    } catch (error) {
        console.error("GET_VIEW_COUNT_ERROR", error);
        return { success: false, count: 0, error: "Failed to fetch view count." };
    }
}