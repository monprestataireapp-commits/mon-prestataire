import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const carnets = await prisma.carnet.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { etapes: true, pagesLivre: true } } },
  });
  return NextResponse.json(carnets);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const format = body.format === "livre" ? "livre" : "blog";
  const carnet = await prisma.carnet.create({
    data: {
      slug: nanoid(8),
      cleModeration: nanoid(16),
      format,
      titre: "",
      sousTitre: "",
      dateDebut: new Date(),
      dateFin: new Date(),
      villes: "[]",
    },
  });
  if (format === "livre") {
    await prisma.pageLivre.create({
      data: { carnetId: carnet.id, ordre: 1, elements: "[]" },
    });
  }
  return NextResponse.json(carnet);
}
