"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { updateSalonSettings } from "@/actions/salonConfigActions";
import { useRouter } from "next/navigation";

// サーバーからデータを取得するために、一旦Server Componentでラップしてデータを渡すのが定石ですが、
// 簡易化のためクライアントからfetch、またはサーバーからpropsで渡す構成にします。
// ここでは「Client Componentで完結させる」ため、useEffectでデータ取得する形（またはServer Actions経由）をとりますが、
// Next.js App Routerの流儀に従い、親をServer Component、フォームをClient Componentに分けます。

// ▼ まずはページ本体 (Server Component)
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SalonSettingsForm from "./SalonSettingsForm"; // 分離したフォーム

const prisma = new PrismaClient();

export default async function SalonSettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user?.salonId) return <div>店舗情報がありません</div>;

  const salon = await prisma.salon.findUnique({
    where: { id: user.salonId },
  });

  if (!salon) return <div>データ読み込みエラー</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">🛠 店舗設定 & UIカスタマイズ</h1>
      <SalonSettingsForm salon={salon} />
    </div>
  );
}