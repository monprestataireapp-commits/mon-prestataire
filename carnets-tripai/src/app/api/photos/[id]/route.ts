import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  const { ordre } = await req.json();
  const photo = await prisma.photo.update({
    where: { id },
    data: { ordre: Number(ordre) },
  });
  return NextResponse.json(photo);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
