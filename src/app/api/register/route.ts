// src/app/api/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, username } = body;

    if (!email || !password || !username) {
      return NextResponse.json({ message: "必須項目が不足しています" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ message: "ユーザー名は半角英数字とアンダースコアのみ使用できます" }, { status: 400 });
    }

    // 重複チェック
    const existingUserByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({ message: "このユーザー名は既に使用されています" }, { status: 409 });
    }

    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({ message: "このメールアドレスは既に使用されています" }, { status: 409 });
    }

    // 作成
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, hashedPassword, username },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json({ message: "サーバーエラーが発生しました" }, { status: 500 });
  }
}