import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function PATCH(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const photo = await prisma.photoLivreOr.update({
    where: { id: params.id },
    data: { approuve: true },
  });
  return NextResponse.json(photo);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  await prisma.photoLivreOr.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
