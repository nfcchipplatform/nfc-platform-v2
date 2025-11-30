// src/actions/updateDirectLink.ts

"use server";

import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth"; // 修正箇所

const prisma = new PrismaClient();

export async function getDirectLinkSettings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "認証されていません" };
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { directLinkEnabled: true, directLinkUrl: true },
    });
    return { success: true, settings: user };
  } catch (error) {
    return { error: "設定の読み込みに失敗しました。" };
  }
}

export async function updateDirectLink(enabled: boolean, url: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "認証されていません" };
  }
  try {
    const dataToUpdate = {
      directLinkEnabled: enabled,
      directLinkUrl: enabled ? url : null,
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    return { success: true };
  } catch (error) {
    console.error("UPDATE_DIRECTLINK_ERROR", error);
    return { success: false, error: "設定の保存に失敗しました。" };
  }
}