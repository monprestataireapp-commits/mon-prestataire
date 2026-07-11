"use client";

import { useState, useEffect, useCallback } from "react";
import GuestBook from "./GuestBook";

type Photo = { id: string; url: string; ordre: number };
type Reaction = { id: string; compteurCoeurs: number };
type Etape = {
  id: string;
  jourLabel: string;
  titre: string;
  texte: string;
  photos: Photo[];
  reactions: Reaction[];
};
type Message = { id: string; prenom: string; message: string };

type Props = {
  carnet: {
    id: string;
    titre: string;
    sousTitre: string;
    photoCouverture: string | null;
    villes: string;
    etapes: Etape[];
  };
  dateDebut: string;
  dateFin: string;
  totalPhotos: number;
  messages: Message[];
};

type Page = {
  type: "cover" | "etape-photos" | "etape-text" | "guestbook" | "back";
  etape?: Etape;
  photos?: Photo[];
};

export default function BookView({ carnet, dateDebut, dateFin, totalPhotos, messages }: Props) {
  const villes: string[] = JSON.parse(carnet.villes || "[]");

  const pages: Page[] = [];
  pages.push({ type: "cover" });
  for (const etape of carnet.etapes) {
    if (etape.photos.length > 0) {
      pages.push({ type: "etape-photos", etape, photos: etape.photos });
    }
    pages.push({ type: "etape-text", etape });
  }
  pages.push({ type: "guestbook" });
  pages.push({ type: "back" });

  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const totalPages = pages.length;

  const goNext = useCallback(() => {
    if (current >= totalPages - 1 || flipping) return;
    setDirection("next");
    setFlipping(true);
    setTimeout(() => {
      setCurrent((c) => c + 1);
      setFlipping(false);
    }, 500);
  }, [current, totalPages, flipping]);

  const goPrev = useCallback(() => {
    if (current <= 0 || flipping) return;
    setDirection("prev");
    setFlipping(true);
    setTimeout(() => {
      setCurrent((c) => c - 1);
      setFlipping(false);
    }, 500);
  }, [current, flipping]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  function renderPage(page: Page) {
    switch (page.type) {
      case "cover":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            style={{
              backgroundImage: `linear-gradient(rgba(45,27,37,0.45), rgba(45,27,37,0.65)), url(${carnet.photoCouverture || "https://picsum.photos/seed/cover/800/1000"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
            <div className="text-white/70 text-xs uppercase tracking-[3px] mb-4 font-medium">
              Carnet de voyage
            </div>
            <h1 className="font-syne text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              {carnet.titre}
            </h1>
            <div className="w-12 h-[2px] bg-[#C8A951] mx-auto mb-4" />
            <p className="text-white/85 text-sm mb-2">
              <strong>{carnet.sousTitre}</strong>
            </p>
            <p className="text-white/60 text-xs">
              {dateDebut} – {dateFin} · {carnet.etapes.length} étapes · {totalPhotos} photos
            </p>
            {villes.length > 0 && (
              <p className="text-white/50 text-xs mt-3">
                {villes.join(" → ")}
              </p>
            )}
            <div className="absolute bottom-6 text-white/40 text-xs animate-pulse">
              Cliquez ou appuyez → pour tourner la page
            </div>
          </div>
        );

      case "etape-photos": {
        const photos = page.photos || [];
        if (photos.length === 1) {
          return (
            <div className="absolute inset-0 p-4 flex flex-col bg-[#FFF8F9]">
              <div className="text-xs font-semibold uppercase tracking-[1.5px] text-[#C8A951] mb-2">
                {page.etape!.jourLabel}
              </div>
              <div className="flex-1 rounded-xl overflow-hidden">
                <img src={photos[0].url} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          );
        }
        if (photos.length === 2) {
          return (
            <div className="absolute inset-0 p-4 flex flex-col gap-2 bg-[#FFF8F9]">
              <div className="text-xs font-semibold uppercase tracking-[1.5px] text-[#C8A951] mb-1">
                {page.etape!.jourLabel}
              </div>
              {photos.map((p) => (
                <div key={p.id} className="flex-1 rounded-xl overflow-hidden">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="absolute inset-0 p-4 flex flex-col bg-[#FFF8F9]">
            <div className="text-xs font-semibold uppercase tracking-[1.5px] text-[#C8A951] mb-2">
              {page.etape!.jourLabel}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="col-span-2 rounded-xl overflow-hidden" style={{ flex: 2 }}>
                <img src={photos[0].url} alt="" className="w-full h-full object-cover" />
              </div>
              {photos.slice(1, 5).map((p) => (
                <div key={p.id} className="rounded-xl overflow-hidden">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {photos.length > 5 && (
                <div className="rounded-xl overflow-hidden relative">
                  <img src={photos[5].url} alt="" className="w-full h-full object-cover brightness-50" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    +{photos.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }

      case "etape-text":
        return (
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col bg-[#FFF8F9]">
            <div className="text-xs font-semibold uppercase tracking-[1.5px] text-[#C8A951] mb-2">
              {page.etape!.jourLabel}
            </div>
            <h2 className="font-syne text-xl sm:text-2xl font-bold tracking-tight mb-4 text-[#2D1B25]">
              {page.etape!.titre}
            </h2>
            <div className="w-8 h-[2px] bg-[#C8748A]/30 mb-4" />
            <p className="text-[0.9rem] sm:text-[0.95rem] leading-[1.8] text-[#5A4450] flex-1 overflow-y-auto">
              {page.etape!.texte}
            </p>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#C8748A]/10">
              <span className="text-[#C8748A]">♥</span>
              <span className="text-xs text-[#8A7080]">
                {page.etape!.reactions[0]?.compteurCoeurs ?? 0} j&apos;aime
              </span>
            </div>
          </div>
        );

      case "guestbook":
        return (
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col bg-[#FFF8F9] overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-[2px] text-[#C8A951] mb-3">
              Livre d&apos;or
            </div>
            <h2 className="font-syne text-xl font-bold tracking-tight mb-4 text-[#2D1B25]">
              Vos messages
            </h2>
            <div className="w-8 h-[2px] bg-[#C8748A]/30 mb-4" />
            <div className="flex-1">
              <GuestBook carnetId={carnet.id} initialMessages={messages} />
            </div>
          </div>
        );

      case "back":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#2D1B25]">
            <div className="font-syne text-2xl font-extrabold text-white mb-2">
              Trip<span className="text-[#C8748A]">AI</span>
              <span className="font-inter font-normal text-sm ml-1 text-white/50">· Carnets</span>
            </div>
            <div className="w-10 h-[2px] bg-[#C8A951] mx-auto my-4" />
            <p className="text-white/50 text-sm max-w-[280px] leading-relaxed mb-6">
              Ce carnet a été composé avec amour à partir des photos et souvenirs de {carnet.sousTitre}.
            </p>
            <p className="text-white/30 text-xs">
              Envie de raconter votre voyage ?
            </p>
            <a
              href="https://tripai-leila.netlify.app"
              className="mt-3 inline-block text-xs px-5 py-2 rounded-full border border-[#C8748A]/40 text-[#C8748A] hover:bg-[#C8748A]/10 transition"
            >
              Commander mon carnet
            </a>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#2D1B25] flex flex-col items-center justify-center py-8 px-4">
      <style>{`
        .book-container {
          perspective: 1800px;
          width: min(480px, 90vw);
          height: min(640px, 80vh);
        }
        .book-page {
          position: absolute;
          inset: 0;
          border-radius: 4px 12px 12px 4px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2);
          transform-origin: left center;
          backface-visibility: hidden;
        }
        .page-flip-next {
          animation: flipNext 0.5s ease-in-out forwards;
        }
        .page-flip-prev {
          animation: flipPrev 0.5s ease-in-out forwards;
        }
        @keyframes flipNext {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes flipPrev {
          0% { transform: rotateY(-180deg); }
          100% { transform: rotateY(0deg); }
        }
        .page-spine {
          background: linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
        }
      `}</style>

      <div className="book-container relative">
        {/* Previous page (visible underneath during flip) */}
        {flipping && direction === "next" && current + 1 < totalPages && (
          <div className="book-page bg-[#FFF8F9]">
            {renderPage(pages[current + 1])}
            <div className="absolute inset-0 page-spine" />
          </div>
        )}
        {flipping && direction === "prev" && current - 1 >= 0 && (
          <div className="book-page bg-[#FFF8F9]">
            {renderPage(pages[current - 1])}
            <div className="absolute inset-0 page-spine" />
          </div>
        )}

        {/* Current page */}
        <div
          className={`book-page bg-[#FFF8F9] ${
            flipping && direction === "next" ? "page-flip-next" : ""
          } ${flipping && direction === "prev" ? "page-flip-prev" : ""}`}
          style={{ zIndex: 2 }}
        >
          {renderPage(pages[current])}
          <div className="absolute inset-0 page-spine" />
        </div>

        {/* Click zones */}
        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
        </div>
      </div>

      {/* Page indicator + nav */}
      <div className="flex items-center gap-4 mt-5">
        <button
          onClick={goPrev}
          disabled={current === 0 || flipping}
          className="text-white/50 hover:text-white disabled:opacity-20 text-2xl transition"
        >
          ‹
        </button>
        <span className="text-white/40 text-xs font-medium">
          {current + 1} / {totalPages}
        </span>
        <button
          onClick={goNext}
          disabled={current === totalPages - 1 || flipping}
          className="text-white/50 hover:text-white disabled:opacity-20 text-2xl transition"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 mt-3">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!flipping && i !== current) {
                setDirection(i > current ? "next" : "prev");
                setFlipping(true);
                setTimeout(() => {
                  setCurrent(i);
                  setFlipping(false);
                }, 500);
              }
            }}
            className={`w-2 h-2 rounded-full transition ${
              i === current ? "bg-[#C8748A]" : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
