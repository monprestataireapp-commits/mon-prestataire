import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: { id: string } };

const lastPostByIp = new Map<string, number>();

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = params;
  const { prenom, message } = await req.json();

  if (!prenom?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Prénom et message requis" }, { status: 400 });
  }
  if (prenom.length > 50 || message.length > 500) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
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

  const msg = await prisma.messageLivreOr.create({
    data: { carnetId: id, prenom: prenom.trim(), message: message.trim() },
  });
  return NextResponse.json(msg);
}
