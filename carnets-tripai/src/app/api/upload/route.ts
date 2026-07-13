import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { storeImage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  const url = await storeImage(file);

  const type = formData.get("type") as string;

  if (type === "cover") {
    const carnetId = formData.get("carnetId") as string;
    await prisma.carnet.update({
      where: { id: carnetId },
      data: { photoCouverture: url },
    });
    return NextResponse.json({ url });
  }

  if (type === "livre") {
    return NextResponse.json({ url });
  }

  const etapeId = formData.get("etapeId") as string;
  const count = await prisma.photo.count({ where: { etapeId } });
  const photo = await prisma.photo.create({
    data: { etapeId, url, ordre: count + 1 },
  });
  return NextResponse.json(photo);
}
