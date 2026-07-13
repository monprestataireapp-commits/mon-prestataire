"use client";

import { useState } from "react";

type PhotoM = { id: string; url: string; approuve: boolean };
type MsgM = { id: string; prenom: string; message: string; photos: PhotoM[] };

export default function ModerationClient({
  cle,
  titre,
  slug,
  initialMessages,
}: {
  cle: string;
  titre: string;
  slug: string;
  initialMessages: MsgM[];
}) {
  const [messages, setMessages] = useState<MsgM[]>(initialMessages);
  const [busy, setBusy] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const enAttente = messages.reduce(
    (n, m) => n + m.photos.filter((p) => !p.approuve).length,
    0
  );

  async function approve(photoId: string) {
    setBusy(photoId);
    const r = await fetch(`/api/moderation/${cle}/photos/${photoId}`, {
      method: "PATCH",
    });
    if (r.ok) {
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          photos: m.photos.map((p) =>
            p.id === photoId ? { ...p, approuve: true } : p
          ),
        }))
      );
    }
    setBusy(null);
  }

  async function reject(photoId: string) {
    if (!confirm("Refuser cette photo ? Elle sera supprimée.")) return;
    setBusy(photoId);
    const r = await fetch(`/api/moderation/${cle}/photos/${photoId}`, {
      method: "DELETE",
    });
    if (r.ok) {
      setMessages((prev) =>
        prev
          .map((m) => ({
            ...m,
            photos: m.photos.filter((p) => p.id !== photoId),
          }))
          .filter((m) => m.photos.length > 0)
      );
    }
    setBusy(null);
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-[rgba(255,248,249,0.92)] backdrop-blur-[12px] border-b border-rose/10 px-6 h-14 flex items-center justify-between">
        <div className="font-syne text-xl font-extrabold tracking-tight">
          Trip<span className="text-rose">AI</span>
          <span className="text-[#8A7080] font-inter font-normal text-sm ml-1">
            · Carnets
          </span>
        </div>
        <a
          href={`/v/${slug}`}
          className="text-xs font-medium text-rose border border-rose/25 px-3 py-1 rounded-full hover:bg-rose/5 transition"
        >
          Voir le carnet ↗
        </a>
      </nav>

      <main className="max-w-[640px] mx-auto px-5 py-8">
        <p className="text-xs font-semibold uppercase tracking-[2px] text-gold mb-1.5">
          Validation des photos
        </p>
        <h1 className="font-syne text-2xl font-bold mb-2">{titre}</h1>
        <p className="text-sm text-[#8A7080] mb-6 leading-relaxed">
          Vos proches ont partagé des photos dans le livre d&apos;or. Choisissez
          celles qui apparaîtront sur votre carnet — rien n&apos;est visible sans
          votre accord.
        </p>

        {enAttente > 0 ? (
          <div className="inline-block text-sm font-medium px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-700 mb-6">
            {enAttente} photo{enAttente > 1 ? "s" : ""} en attente de votre
            validation
          </div>
        ) : (
          <div className="inline-block text-sm font-medium px-3.5 py-1.5 rounded-full bg-green-100 text-green-700 mb-6">
            ✓ Tout est à jour
          </div>
        )}

        {messages.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-[#8A7080]">
            <p className="text-3xl mb-3">📷</p>
            <p className="text-sm">
              Aucune photo partagée pour le moment. Revenez sur cette page quand
              vos proches en auront ajouté.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm mb-3">
                <strong className="text-rose">{m.prenom}</strong> — {m.message}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {m.photos.map((p) => (
                  <div key={p.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={`Photo de ${m.prenom}`}
                      onClick={() => setLightbox(p.url)}
                      className={`w-full aspect-square object-cover rounded-xl cursor-pointer ${
                        p.approuve ? "" : "ring-2 ring-amber-400"
                      }`}
                    />
                    {p.approuve ? (
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] font-medium text-green-700">
                          ✓ Sur le carnet
                        </span>
                        <button
                          onClick={() => reject(p.id)}
                          disabled={busy === p.id}
                          className="text-[11px] text-red-500 underline disabled:opacity-40"
                        >
                          Retirer
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          onClick={() => approve(p.id)}
                          disabled={busy === p.id}
                          className="flex-1 text-xs font-semibold bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-40"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => reject(p.id)}
                          disabled={busy === p.id}
                          className="flex-1 text-xs font-semibold border border-red-300 text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-40"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#8A7080] mt-8 text-center leading-relaxed">
          Ce lien de validation est personnel — ne le partagez pas avec vos
          invités.
        </p>
      </main>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
