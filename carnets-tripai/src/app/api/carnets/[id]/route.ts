import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  const carnet = await prisma.carnet.findUnique({
    where: { id },
    include: {
      etapes: {
        orderBy: { ordre: "asc" },
        include: { photos: { orderBy: { ordre: "asc" } } },
      },
      pagesLivre: { orderBy: { ordre: "asc" } },
    },
  });
  if (!carnet) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(carnet);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  const data = await req.json();
  const update: Record<string, unknown> = {};
  if (data.titre !== undefined) update.titre = data.titre;
  if (data.sousTitre !== undefined) update.sousTitre = data.sousTitre;
  if (data.dateDebut !== undefined) update.dateDebut = new Date(data.dateDebut);
  if (data.dateFin !== undefined) update.dateFin = new Date(data.dateFin);
  if (data.villes !== undefined) update.villes = data.villes;
  if (data.photoCouverture !== undefined) update.photoCouverture = data.photoCouverture;
  if (data.publie !== undefined) update.publie = data.publie;

  const carnet = await prisma.carnet.update({ where: { id }, data: update });
  return NextResponse.json(carnet);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = params;
  const carnet = await prisma.carnet.findUnique({ where: { id } });
  if (!carnet) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  await prisma.carnet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
