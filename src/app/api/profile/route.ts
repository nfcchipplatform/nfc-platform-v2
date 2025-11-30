// src/app/api/profile/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth"; // ★ここが修正ポイント

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, title, bio, website, twitter, instagram } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
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

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}