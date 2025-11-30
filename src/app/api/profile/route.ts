// src/app/api/profile/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"; 
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// PATCHリクエスト（データの一部を更新する）を処理する関数
// このファイルは現在、サーバーアクションに役割を譲ったため、直接は使用されていません。
// 将来的にクライアントサイドからの複雑な更新処理が必要になった場合のために残しておきます。
export async function PATCH(request: Request) {
  try {
    // 現在ログインしているユーザーのセッション情報を取得
    const session = await getServerSession(authOptions);

    // ログインしていない場合はエラー
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // リクエストボディから更新したいプロフィール情報を取得
    const body = await request.json();
    const { name, title, bio, website, twitter, instagram } = body;

    // データベースのユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id, // ログインしているユーザーのIDを指定
      },
      data: {
        name,
        title,
        bio,
        website,
        twitter,
        instagram,
      },
    });

    // 成功したら更新されたユーザー情報を返す
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}