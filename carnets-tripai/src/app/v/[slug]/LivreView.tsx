"use client";

import { useState, useEffect, useCallback } from "react";
import GuestBook from "./GuestBook";

type Element = {
  id: string;
  type: "photo" | "text";
  url?: string;
  content?: string;
  size?: "small" | "medium" | "large" | "full";
  textSize?: "sm" | "md" | "lg" | "xl";
  font?: "sans" | "serif" | "cursive";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

type PageData = { id: string; ordre: number; elements: string };
type Message = { id: string; prenom: string; message: string };

type Props = {
  carnet: {
    id: string;
    titre: string;
    sousTitre: string;
    photoCouverture: string | null;
    villes: string;
  };
  pages: PageData[];
  dateDebut: string;
  dateFin: string;
  messages: Message[];
};

const SIZE_MAP: Record<string, string> = {
  small: "33%",
  medium: "50%",
  large: "75%",
  full: "100%",
};

const TEXT_SIZE_MAP: Record<string, string> = {
  xs: "10px",
  sm: "12px",
  md: "14px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "30px",
  "4xl": "36px",
  "5xl": "48px",
};

type BookPage = { type: "cover" | "content" | "guestbook" | "back"; pageData?: PageData };

export default function LivreView({ carnet, pages, dateDebut, dateFin, messages }: Props) {
  const villes: string[] = JSON.parse(carnet.villes || "[]");

  const bookPages: BookPage[] = [{ type: "cover" }];
  for (const p of pages) {
    bookPages.push({ type: "content", pageData: p });
  }
  bookPages.push({ type: "guestbook" });
  bookPages.push({ type: "back" });

  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const total = bookPages.length;

  const goNext = useCallback(() => {
    if (current >= total - 1 || flipping) return;
    setDirection("next");
    setFlipping(true);
    setTimeout(() => { setCurrent((c) => c + 1); setFlipping(false); }, 500);
  }, [current, total, flipping]);

  const goPrev = useCallback(() => {
    if (current <= 0 || flipping) return;
    setDirection("prev");
    setFlipping(true);
    setTimeout(() => { setCurrent((c) => c - 1); setFlipping(false); }, 500);
  }, [current, flipping]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  function renderElements(elements: Element[]) {
    const freeLayout =
      elements.length > 0 &&
      elements.every((el) => el.x != null && el.y != null && el.w != null);

    if (freeLayout) {
      return (
        <div className="relative w-full h-full">
          {elements.map((el) => (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                // Photos: fixed height for cropping. Text: never clip, always show full content.
                ...(el.type === "photo" && el.h ? { height: `${el.h}%`, overflow: "hidden" } : {}),
              }}
            >
              {el.type === "photo" ? (
                <img
                  src={el.url}
                  alt=""
                  className="w-full rounded-lg"
                  style={{
                    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                    ...(el.h ? { height: "100%", objectFit: "cover" as const } : {}),
                  }}
                />
              ) : (
                <p
                  className="leading-relaxed whitespace-pre-wrap break-words"
                  style={{
                    fontSize: TEXT_SIZE_MAP[el.textSize || "md"],
                    color: el.color || "#5A4450",
                    fontFamily: el.font === "cursive" ? "'Dancing Script', cursive" : el.font === "serif" ? "Georgia, 'Times New Roman', serif" : "inherit",
                    fontWeight: el.bold ? "bold" : "normal",
                    fontStyle: el.italic ? "italic" : "normal",
                    textDecoration: el.underline ? "underline" : "none",
                    textAlign: el.align || "left",
                  }}
                >
                  {el.content}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-3 p-5 h-full content-start overflow-y-auto">
        {elements.map((el) => (
          <div
            key={el.id}
            style={{ width: SIZE_MAP[el.size || "medium"], flexShrink: 0 }}
          >
            {el.type === "photo" ? (
              <img
                src={el.url}
                alt=""
                className="w-full rounded-lg object-cover"
                style={{
                  height: el.size === "small" ? "100px" : el.size === "medium" ? "160px" : el.size === "large" ? "220px" : "280px",
                }}
              />
            ) : (
              <p
                className="leading-relaxed"
                style={{
                  fontSize: TEXT_SIZE_MAP[el.textSize || "md"],
                  color: el.color || "#5A4450",
                  fontFamily: el.font === "cursive" ? "'Dancing Script', cursive" : el.font === "serif" ? "Georgia, 'Times New Roman', serif" : "inherit",
                  fontWeight: el.bold ? "bold" : "normal",
                  fontStyle: el.italic ? "italic" : "normal",
                  textDecoration: el.underline ? "underline" : "none",
                  textAlign: el.align || "left",
                }}
              >
                {el.content}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderPage(page: BookPage) {
    switch (page.type) {
      case "cover":
        return (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            style={{
              backgroundImage: `linear-gradient(rgba(45,27,37,0.45), rgba(45,27,37,0.65)), url(${carnet.photoCouverture || "https://picsum.photos/seed/cover/800/1000"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
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
              {dateDebut} – {dateFin}
            </p>
            {villes.length > 0 && (
              <p className="text-white/50 text-xs mt-3">{villes.join(" → ")}</p>
            )}
            <div className="absolute bottom-6 text-white/40 text-xs animate-pulse">
              Cliquez ou appuyez → pour tourner la page
            </div>
          </div>
        );

      case "content": {
        const elements: Element[] = JSON.parse(page.pageData!.elements || "[]");
        return (
          <div className="absolute inset-0 bg-[#FFF8F9]">
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[#8A7080] text-sm">
                Page vide
              </div>
            ) : (
              renderElements(elements)
            )}
          </div>
        );
      }

      case "guestbook":
        return (
          <div className="absolute inset-0 p-5 bg-[#FFF8F9] overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-[2px] text-[#C8A951] mb-3">
              Livre d&apos;or
            </div>
            <h2 className="font-syne text-xl font-bold tracking-tight mb-4 text-[#2D1B25]">
              Vos messages
            </h2>
            <div className="w-8 h-[2px] bg-[#C8748A]/30 mb-4" />
            <GuestBook carnetId={carnet.id} initialMessages={messages} />
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
            <a
              href="https://tripai-phi.vercel.app"
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
        .book-container { perspective: 1800px; width: min(480px, 90vw, 60vh); aspect-ratio: 3 / 4; }
        .book-page {
          position: absolute; inset: 0;
          border-radius: 4px 12px 12px 4px; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2);
          transform-origin: left center; backface-visibility: hidden;
        }
        .flip-next { animation: flipN 0.5s ease-in-out forwards; }
        .flip-prev { animation: flipP 0.5s ease-in-out forwards; }
        @keyframes flipN { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
        @keyframes flipP { from { transform: rotateY(-180deg); } to { transform: rotateY(0deg); } }
        .page-spine { background: linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.05) 100%); pointer-events: none; }
      `}</style>

      <div className="book-container relative">
        {flipping && direction === "next" && current + 1 < total && (
          <div className="book-page bg-[#FFF8F9]">
            {renderPage(bookPages[current + 1])}
            <div className="absolute inset-0 page-spine" />
          </div>
        )}
        {flipping && direction === "prev" && current - 1 >= 0 && (
          <div className="book-page bg-[#FFF8F9]">
            {renderPage(bookPages[current - 1])}
            <div className="absolute inset-0 page-spine" />
          </div>
        )}

        <div
          className={`book-page bg-[#FFF8F9] ${flipping && direction === "next" ? "flip-next" : ""} ${flipping && direction === "prev" ? "flip-prev" : ""}`}
          style={{ zIndex: 2 }}
        >
          {renderPage(bookPages[current])}
          <div className="absolute inset-0 page-spine" />
        </div>

        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full cursor-pointer" onClick={goNext} />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-5">
        <button onClick={goPrev} disabled={current === 0 || flipping} className="text-white/50 hover:text-white disabled:opacity-20 text-2xl transition">‹</button>
        <span className="text-white/40 text-xs font-medium">{current + 1} / {total}</span>
        <button onClick={goNext} disabled={current === total - 1 || flipping} className="text-white/50 hover:text-white disabled:opacity-20 text-2xl transition">›</button>
      </div>

      <div className="flex gap-1.5 mt-3">
        {bookPages.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (!flipping && i !== current) {
                setDirection(i > current ? "next" : "prev");
                setFlipping(true);
                setTimeout(() => { setCurrent(i); setFlipping(false); }, 500);
              }
            }}
            className={`w-2 h-2 rounded-full transition ${i === current ? "bg-[#C8748A]" : "bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
