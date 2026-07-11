import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string; pageId: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { pageId } = params;
  const data = await req.json();
  const page = await prisma.pageLivre.update({
    where: { id: pageId },
    data,
  });
  return NextResponse.json(page);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { pageId } = params;
  await prisma.pageLivre.delete({ where: { id: pageId } });
  return NextResponse.json({ ok: true });
}
