// src/actions/updateProfile.ts

"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth"; // 修正箇所
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

interface ProfileData {
  name?: string;
  title?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  image?: string | null;
}

export async function updateProfile(data: ProfileData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("認証されていません");
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: data,
    });
    console.log("🎉 データベースの更新コマンドは成功しました");

    revalidatePath('/dashboard/profile');
    if (updatedUser.username) {
        revalidatePath(`/${updatedUser.username}`);
    }

    return { success: true, user: updatedUser };

  } catch (error) {
    console.error("❌ PROFILE_UPDATE_ERROR:", error);
    return { success: false, error: "プロフィールの更新に失敗しました。" };
  }
}