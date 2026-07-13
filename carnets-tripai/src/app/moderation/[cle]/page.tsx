import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ModerationClient from "./ModerationClient";

type Props = { params: { cle: string } };

export const metadata: Metadata = {
  title: "Validation des photos — TripAI Carnets",
  robots: { index: false, follow: false },
};

export default async function ModerationPage({ params }: Props) {
  const carnet = await prisma.carnet.findUnique({
    where: { cleModeration: params.cle },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        include: { photos: true },
      },
    },
  });
  if (!carnet) notFound();

  const messages = carnet.messages
    .filter((m) => m.photos.length > 0)
    .map((m) => ({
      id: m.id,
      prenom: m.prenom,
      message: m.message,
      photos: m.photos.map((p) => ({
        id: p.id,
        url: p.url,
        approuve: p.approuve,
      })),
    }));

  return (
    <ModerationClient
      cle={params.cle}
      titre={carnet.titre || "Votre carnet"}
      slug={carnet.slug}
      initialMessages={messages}
    />
  );
}
