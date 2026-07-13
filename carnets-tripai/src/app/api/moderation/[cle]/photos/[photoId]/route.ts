import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { cle: string; photoId: string } };

async function checkOwnership(cle: string, photoId: string) {
  const carnet = await prisma.carnet.findUnique({
    where: { cleModeration: cle },
  });
  if (!carnet) return null;
  const photo = await prisma.photoLivreOr.findUnique({
    where: { id: photoId },
    include: { message: true },
  });
  if (!photo || photo.message.carnetId !== carnet.id) return null;
  return photo;
}

export async function PATCH(_req: NextRequest, { params }: Ctx) {
  const photo = await checkOwnership(params.cle, params.photoId);
  if (!photo) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  const updated = await prisma.photoLivreOr.update({
    where: { id: photo.id },
    data: { approuve: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const photo = await checkOwnership(params.cle, params.photoId);
  if (!photo) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  await prisma.photoLivreOr.delete({ where: { id: photo.id } });
  return NextResponse.json({ ok: true });
}
