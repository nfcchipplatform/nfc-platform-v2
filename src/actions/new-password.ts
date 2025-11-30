// src/actions/new-password.ts

"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getPasswordResetTokenByToken } from "@/lib/tokens";

const prisma = new PrismaClient();

export const newPassword = async (values: { password: string }, token: string | null) => {
  if (!token) {
    return { error: "トークンが見つかりません。" };
  }

  try {
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return { error: "無効なトークンです。" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return { error: "トークンの有効期限が切れています。" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.identifier },
    });

    if (!existingUser) {
      return { error: "ユーザーが存在しません。" };
    }

    const hashedPassword = await bcrypt.hash(values.password, 12);

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: { token: existingToken.token },
    });

    return { success: "パスワードが変更されました！" };
  } catch (error) {
    console.error("NEW_PASSWORD_ERROR:", error);
    return { error: "パスワード更新中にエラーが発生しました。" };
  }
};