import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 店舗更新
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const salonCode = formData.get("salonCode") as string;
    const location = formData.get("location") as string;

    if (!id || !name || !slug || !salonCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.salon.update({
      where: { id },
      data: { name, slug, salonCode, location: location || null }
    });
    revalidatePath('/dashboard/admin/salons');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// 店舗削除
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.salon.delete({
      where: { id }
    });
    revalidatePath('/dashboard/admin/salons');
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

