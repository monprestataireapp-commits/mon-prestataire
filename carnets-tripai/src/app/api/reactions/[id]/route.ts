import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const { etapeId } = await req.json();

  const reaction = await prisma.reaction.findUnique({ where: { id } });
  if (reaction) {
    const updated = await prisma.reaction.update({
      where: { id },
      data: { compteurCoeurs: { increment: 1 } },
    });
    return NextResponse.json(updated);
  }

  const byEtape = await prisma.reaction.findUnique({ where: { etapeId } });
  if (byEtape) {
    const updated = await prisma.reaction.update({
      where: { id: byEtape.id },
      data: { compteurCoeurs: { increment: 1 } },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.reaction.create({
    data: { etapeId, compteurCoeurs: 1 },
  });
  return NextResponse.json(created);
}
