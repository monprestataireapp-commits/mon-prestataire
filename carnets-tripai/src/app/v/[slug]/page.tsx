import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import HeartButton from "./HeartButton";
import GuestBook from "./GuestBook";
import PhotoGallery from "./PhotoGallery";
import LivreView from "./LivreView";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const carnet = await prisma.carnet.findUnique({ where: { slug } });
  if (!carnet) return {};
  const dateDebut = new Date(carnet.dateDebut).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    title: `${carnet.titre} — Carnet de ${carnet.sousTitre}`,
    description: `${carnet.sousTitre} raconte son voyage. Un carnet composé avec TripAI.`,
    openGraph: {
      title: `${carnet.titre} — Carnet de voyage`,
      description: `${carnet.sousTitre} · À partir du ${dateDebut}`,
      images: carnet.photoCouverture ? [carnet.photoCouverture] : [],
    },
    robots: { index: false, follow: false },
  };
}

export default async function CarnetPublic({ params }: Props) {
  const { slug } = params;
  const carnet = await prisma.carnet.findUnique({
    where: { slug },
    include: {
      etapes: {
        orderBy: { ordre: "asc" },
        include: {
          photos: { orderBy: { ordre: "asc" } },
          reactions: true,
        },
      },
      pagesLivre: { orderBy: { ordre: "asc" } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { photos: { where: { approuve: true } } },
      },
    },
  });

  if (!carnet) notFound();
  const admin = await isAuthenticated();
  if (!carnet.publie && !admin) notFound();

  const villes: string[] = JSON.parse(carnet.villes || "[]");
  const dateDebut = new Date(carnet.dateDebut).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  const dateFin = new Date(carnet.dateFin).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const totalPhotos = carnet.etapes.reduce(
    (acc, e) => acc + e.photos.length,
    0
  );

  const messagesData = carnet.messages.map((m) => ({
    id: m.id,
    prenom: m.prenom,
    message: m.message,
    photos: m.photos.map((p) => ({ id: p.id, url: p.url })),
  }));

  // ── Livre format ──
  if (carnet.format === "livre") {
    return (
      <LivreView
        carnet={{
          id: carnet.id,
          titre: carnet.titre,
          sousTitre: carnet.sousTitre,
          photoCouverture: carnet.photoCouverture,
          villes: carnet.villes,
        }}
        pages={carnet.pagesLivre.map((p) => ({
          id: p.id,
          ordre: p.ordre,
          elements: p.elements,
        }))}
        dateDebut={dateDebut}
        dateFin={dateFin}
        messages={messagesData}
      />
    );
  }

  // ── Blog format ──
  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(255,248,249,0.92)] backdrop-blur-[12px] border-b border-rose/10 px-6 h-14 flex items-center justify-between">
        <div className="font-syne text-xl font-extrabold tracking-tight">
          Trip<span className="text-rose">AI</span>
          <span className="text-[#8A7080] font-inter font-normal text-sm ml-1">
            · Carnets
          </span>
        </div>
        <div className="text-xs font-medium text-gold bg-gold/10 border border-gold/25 px-3 py-1 rounded-full">
          Carnet privé
        </div>
      </nav>

      {/* Cover */}
      <header
        className="relative min-h-[78vh] flex items-end bg-cover bg-center"
        style={{
          backgroundImage: `url(${carnet.photoCouverture || "https://picsum.photos/seed/cover/1600/1000"})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-dark/25 via-transparent to-dark/75" />
        <div className="relative z-10 w-full max-w-[760px] mx-auto px-6 pb-14">
          <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/35 text-white text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 backdrop-blur-sm tracking-wide">
            ✈ Carnet de voyage
          </div>
          <h1 className="font-syne text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold text-white leading-[1.1] tracking-tight mb-3">
            {carnet.titre}
          </h1>
          <div className="text-white/85 text-[0.95rem]">
            <strong className="font-semibold">{carnet.sousTitre}</strong> ·{" "}
            {dateDebut} – {dateFin} · {carnet.etapes.length} étapes ·{" "}
            {totalPhotos} photos
          </div>
        </div>
      </header>

      {/* Route */}
      {villes.length > 0 && (
        <div className="max-w-[760px] mx-auto px-6 py-5 flex items-center gap-2.5 flex-wrap text-sm font-medium border-b border-rose/15">
          {villes.map((v, i) => (
            <span key={i} className="flex items-center gap-2.5">
              {i === 0 && <span className="text-rose mr-0.5">📍</span>}
              {v}
              {i < villes.length - 1 && (
                <span className="text-rose">→</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Steps */}
      <main className="max-w-[760px] mx-auto px-6 py-6 pb-10">
        {carnet.etapes.map((etape) => {
          const reaction = etape.reactions[0];
          const count = reaction?.compteurCoeurs ?? 0;

          return (
            <article
              key={etape.id}
              className="py-9 border-b border-rose/10 last:border-b-0"
            >
              <div className="text-xs font-semibold uppercase tracking-[1.5px] text-gold mb-1.5">
                {etape.jourLabel}
              </div>
              <h2 className="font-syne text-2xl font-bold tracking-tight mb-4">
                {etape.titre}
              </h2>

              <PhotoGallery photos={etape.photos} />

              <p className="text-[0.98rem] leading-[1.7] text-[#5A4450] mb-3.5 max-w-[620px]">
                {etape.texte}
              </p>

              <HeartButton
                etapeId={etape.id}
                initialCount={count}
                reactionId={reaction?.id}
              />
            </article>
          );
        })}
      </main>

      {/* Guest book */}
      <GuestBook carnetId={carnet.id} initialMessages={messagesData} />

      {/* Footer */}
      <footer className="bg-dark text-white/70 text-center py-10 px-6">
        <div className="font-syne text-xl font-extrabold text-white mb-2">
          Trip<span className="text-rose">AI</span>
          <span className="font-inter font-normal text-sm ml-1">
            · Carnets
          </span>
        </div>
        <p className="text-sm max-w-[420px] mx-auto mb-5 leading-relaxed">
          Ce carnet a été composé à partir des photos et souvenirs de{" "}
          {carnet.sousTitre}. Envie de raconter votre voyage à vos proches ?
        </p>
        <a
          href="https://tripai-leila.netlify.app"
          className="inline-block btn-grad rounded-full px-7 py-3 text-sm"
        >
          Commander mon carnet
        </a>
      </footer>
    </>
  );
}
