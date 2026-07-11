import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  const last = await prisma.pageLivre.findFirst({
    where: { carnetId: id },
    orderBy: { ordre: "desc" },
  });
  const page = await prisma.pageLivre.create({
    data: {
      carnetId: id,
      ordre: (last?.ordre ?? 0) + 1,
      elements: "[]",
    },
  });
  return NextResponse.json(page);
}
