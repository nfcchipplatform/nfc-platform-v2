"use server";

import { getServerSession } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function unlinkNfcCard() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "認証されていません。" };
    }

    const dataToUpdate: Prisma.UserUpdateInput = {
      nfcCardId: null,
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    revalidatePath('/dashboard/settings');

    return { success: true };

  } catch (error) {
    console.error("NFC_UNLINK_ERROR", error);
    return { success: false, error: "NFCカードの紐付け解除に失敗しました。" };
  }
}
