// src/actions/linkNfcCard.ts

"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function linkNfcCard(userId: string, cardId: string) {
  console.log("🚀 NFC Link Action 呼び出し開始"); // ▼▼▼ 追加
  console.log(`- ユーザーID: ${userId}, カードID: ${cardId}`); // ▼▼▼ 追加
  try {
    // 他のユーザーが既にそのカードIDを使用していないか確認
    const existingCardUser = await prisma.user.findUnique({
      where: { nfcCardId: cardId },
    });

    if (existingCardUser) {
      console.log("🚫 カードは既に使用されています"); // ▼▼▼ 追加
      return { success: false, error: "このNFCカードは既に使用されています。" };
    }

    // ユーザーにカードIDをセットして更新
    await prisma.user.update({
      where: { id: userId },
      data: { nfcCardId: cardId },
    });
    
    console.log("🎉 NFCカード紐付け成功！"); // ▼▼▼ 追加

    return { success: true };

  } catch (error) {
    console.error("❌ NFC_LINK_ERROR", error); // ▼▼▼ エラー時にもログを出す
    return { success: false, error: "NFCカードの紐付けに失敗しました。" };
  }
}