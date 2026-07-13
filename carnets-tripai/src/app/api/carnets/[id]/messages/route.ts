import { prisma } from "@/lib/prisma";
import { storeImage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

const lastPostByIp = new Map<string, number>();

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = params;

  let prenom: string | undefined;
  let message: string | undefined;
  let files: File[] = [];

  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    prenom = (formData.get("prenom") as string) || "";
    message = (formData.get("message") as string) || "";
    files = formData
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0);
  } else {
    const body = await req.json();
    prenom = body.prenom;
    message = body.message;
  }

  if (!prenom?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Prénom et message requis" }, { status: 400 });
  }
  if (prenom.length > 50 || message.length > 500) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
  }
  if (files.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `${MAX_PHOTOS} photos maximum par message.` },
      { status: 400 }
    );
  }
  for (const f of files) {
    if (!f.type.startsWith("image/")) {
      return NextResponse.json({ error: "Seules les images sont acceptées." }, { status: 400 });
    }
    if (f.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Photo trop lourde (4 Mo maximum)." }, { status: 400 });
    }
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const last = lastPostByIp.get(ip) || 0;
  if (now - last < 60_000) {
    return NextResponse.json(
      { error: "Veuillez patienter 1 minute entre chaque message." },
      { status: 429 }
    );
  }
  lastPostByIp.set(ip, now);

  const urls: string[] = [];
  for (const f of files) {
    urls.push(await storeImage(f));
  }

  const msg = await prisma.messageLivreOr.create({
    data: {
      carnetId: id,
      prenom: prenom.trim(),
      message: message.trim(),
      photos: { create: urls.map((url) => ({ url })) },
    },
    include: { photos: true },
  });

  return NextResponse.json({
    id: msg.id,
    prenom: msg.prenom,
    message: msg.message,
    photosEnAttente: msg.photos.length,
  });
}
