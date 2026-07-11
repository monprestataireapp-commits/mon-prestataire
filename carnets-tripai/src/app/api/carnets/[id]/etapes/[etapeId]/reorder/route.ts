import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string; etapeId: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id, etapeId } = params;
  const { direction } = await req.json();
  const etapes = await prisma.etape.findMany({
    where: { carnetId: id },
    orderBy: { ordre: "asc" },
  });
  const idx = etapes.findIndex((e) => e.id === etapeId);
  if (idx === -1) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= etapes.length) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.etape.update({ where: { id: etapes[idx].id }, data: { ordre: etapes[swapIdx].ordre } }),
    prisma.etape.update({ where: { id: etapes[swapIdx].id }, data: { ordre: etapes[idx].ordre } }),
  ]);

  return NextResponse.json({ ok: true });
}
