"use client";

import { useCallback, useEffect, useState } from "react";

type PhotoLO = { id: string; url: string; approuve: boolean };
type MsgLO = { id: string; prenom: string; message: string; photos: PhotoLO[] };

export default function ModerationLivreOr({ carnetId }: { carnetId: string }) {
  const [messages, setMessages] = useState<MsgLO[]>([]);
  const [cleModeration, setCleModeration] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/carnets/${carnetId}`);
    if (r.ok) {
      const data = await r.json();
      setMessages(data.messages || []);
      setCleModeration(data.cleModeration || null);
    }
  }, [carnetId]);

  function copyClientLink() {
    if (!cleModeration) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/moderation/${cleModeration}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    load();
  }, [load]);

  async function approve(photoId: string) {
    await fetch(`/api/photos-livre-or/${photoId}`, { method: "PATCH" });
    await load();
  }

  async function reject(photoId: string) {
    if (!confirm("Refuser et supprimer cette photo ?")) return;
    await fetch(`/api/photos-livre-or/${photoId}`, { method: "DELETE" });
    await load();
  }

  const enAttente = messages.reduce(
    (n, m) => n + m.photos.filter((p) => !p.approuve).length,
    0
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <h2 className="font-bold text-lg">Livre d&apos;or</h2>
        <span className="text-xs text-[#8A7080]">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </span>
        {enAttente > 0 && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {enAttente} photo{enAttente > 1 ? "s" : ""} en attente
          </span>
        )}
        {cleModeration && (
          <button
            onClick={copyClientLink}
            className="text-xs px-3 py-1.5 rounded-lg border border-rose/20 text-rose hover:bg-rose/5 transition ml-auto"
          >
            {copied ? "✓ Copié !" : "Copier le lien de validation client"}
          </button>
        )}
      </div>
      <p className="text-xs text-[#8A7080] mb-4">
        C&apos;est votre client qui valide les photos de ses invités : envoyez-lui
        le lien de validation avec le lien du carnet.
      </p>

      {messages.length === 0 && (
        <p className="text-sm text-[#8A7080]">Aucun message pour le moment.</p>
      )}

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="border-b border-rose/10 last:border-b-0 pb-3">
            <p className="text-sm">
              <strong className="text-rose">{m.prenom}</strong> — {m.message}
            </p>
            {m.photos.length > 0 && (
              <div className="flex gap-3 mt-2 flex-wrap">
                {m.photos.map((p) => (
                  <div key={p.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt=""
                      className={`w-24 h-24 object-cover rounded-lg shadow-sm ${
                        p.approuve ? "" : "ring-2 ring-amber-400"
                      }`}
                    />
                    {p.approuve ? (
                      <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                          ✓ visible
                        </span>
                        <button
                          onClick={() => reject(p.id)}
                          title="Supprimer cette photo"
                          className="text-[9px] bg-white/90 text-red-500 px-1.5 py-0.5 rounded-full"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="absolute bottom-1 left-1 right-1 flex justify-between gap-1">
                        <button
                          onClick={() => approve(p.id)}
                          className="flex-1 text-[10px] bg-green-600 text-white py-0.5 rounded-full font-medium hover:bg-green-700"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => reject(p.id)}
                          className="flex-1 text-[10px] bg-red-500 text-white py-0.5 rounded-full font-medium hover:bg-red-600"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
