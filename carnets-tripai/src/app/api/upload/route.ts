import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
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

  let url: string;

  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    url = blob.url;
  } else {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    await fs.writeFile(path.join(uploadDir, filename), buffer);
    url = `/uploads/${filename}`;
  }

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
