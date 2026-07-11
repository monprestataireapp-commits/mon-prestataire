import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  const count = await prisma.etape.count({ where: { carnetId: id } });
  const etape = await prisma.etape.create({
    data: {
      carnetId: id,
      ordre: count + 1,
      jourLabel: `Jour ${count + 1}`,
      titre: "",
      texte: "",
    },
  });
  await prisma.reaction.create({
    data: { etapeId: etape.id, compteurCoeurs: 0 },
  });
  return NextResponse.json(etape);
}
