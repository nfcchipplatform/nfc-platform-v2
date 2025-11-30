// src/actions/reset.ts

"use server";

import { PrismaClient } from "@prisma/client";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

const prisma = new PrismaClient();

export const reset = async (email: string) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return { error: "このメールアドレスは登録されていません。" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);

    await sendPasswordResetEmail(
      passwordResetToken.identifier,
      passwordResetToken.token,
    );

    return { success: "リセット用のメールを送信しました！" };
  } catch (error) {
    console.error("RESET_ERROR:", error);
    return { error: "メール送信中にエラーが発生しました。" };
  }
};