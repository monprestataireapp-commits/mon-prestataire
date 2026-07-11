import { isAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (await isAuthenticated()) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
