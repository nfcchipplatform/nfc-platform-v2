// src/lib/tokens.ts

import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  // 有効期限を1時間後に設定
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // 既存のトークンがあれば削除（常に最新の1つだけを有効にするため）
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email }
  });

  if (existingToken) {
    // スキーマに合わせて削除ロジックを調整
    await prisma.verificationToken.delete({
      where: {
        token: existingToken.token, // tokenが@uniqueなのでこれで削除可能
      },
    });
  }

  // 新しいトークンを作成
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
};

// トークンが正しいかチェックする関数
export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    return passwordResetToken;
  } catch {
    return null;
  }
};