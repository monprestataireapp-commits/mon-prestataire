import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string; etapeId: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { etapeId } = params;
  const data = await req.json();
  const update: Record<string, unknown> = {};
  if (data.jourLabel !== undefined) update.jourLabel = data.jourLabel;
  if (data.titre !== undefined) update.titre = data.titre;
  if (data.texte !== undefined) update.texte = data.texte;

  const etape = await prisma.etape.update({ where: { id: etapeId }, data: update });
  return NextResponse.json(etape);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { etapeId } = params;
  await prisma.etape.delete({ where: { id: etapeId } });
  return NextResponse.json({ ok: true });
}
