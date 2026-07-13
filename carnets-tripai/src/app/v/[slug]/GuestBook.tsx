"use client";

import { useState, useRef } from "react";

type MsgPhoto = { id: string; url: string };
type Msg = { id: string; prenom: string; message: string; photos?: MsgPhoto[] };

const MAX_PHOTOS = 3;

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const maxDim = 1600;
  let { width, height } = bitmap;
  if (width <= maxDim && height <= maxDim && file.size < 800_000) return file;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  const blob: Blob | null = await new Promise((r) =>
    canvas.toBlob(r, "image/jpeg", 0.82)
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

export default function GuestBook({
  carnetId,
  initialMessages,
}: {
  carnetId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [prenom, setPrenom] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const next = [...photos, ...images].slice(0, MAX_PHOTOS);
    setPhotos(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    if (fileInput.current) fileInput.current.value = "";
  }

  function removePhoto(i: number) {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    setNotice("");

    let r: Response;
    if (photos.length > 0) {
      const fd = new FormData();
      fd.append("prenom", prenom.trim());
      fd.append("message", message.trim());
      for (const f of photos) {
        fd.append("photos", await compressImage(f));
      }
      r = await fetch(`/api/carnets/${carnetId}/messages`, {
        method: "POST",
        body: fd,
      });
    } else {
      r = await fetch(`/api/carnets/${carnetId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom: prenom.trim(), message: message.trim() }),
      });
    }

    if (r.ok) {
      const msg = await r.json();
      setMessages((prev) => [...prev, { id: msg.id, prenom: msg.prenom, message: msg.message }]);
      setPrenom("");
      setMessage("");
      setPhotos([]);
      setPreviews([]);
      if (msg.photosEnAttente > 0) {
        setNotice(
          msg.photosEnAttente > 1
            ? "Merci ! Vos photos seront visibles après validation."
            : "Merci ! Votre photo sera visible après validation."
        );
      }
    } else {
      const data = await r.json().catch(() => null);
      setError(data?.error || "Erreur");
    }
    setSending(false);
  }

  return (
    <section className="max-w-[760px] mx-auto mb-10 px-6">
      <div className="bg-white rounded-[14px] shadow-[0_4px_24px_rgba(200,116,138,0.12)] p-7">
        <h3 className="font-syne text-lg font-bold mb-4">Livre d&apos;or</h3>
        {messages.map((m) => (
          <div
            key={m.id}
            className="py-2.5 border-b border-rose/10 last:border-b-0 text-[0.9rem]"
          >
            <strong className="text-rose">{m.prenom}</strong> — {m.message}
            {m.photos && m.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {m.photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={`Photo de ${m.prenom}`}
                    onClick={() => setLightbox(p.url)}
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-85 transition shadow-sm"
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <form onSubmit={submit} className="mt-4">
          <div className="flex gap-2 flex-wrap">
            <input
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Votre prénom"
              maxLength={50}
              className="w-[130px] px-3.5 py-2.5 border border-rose/30 rounded-[10px] outline-none focus:border-rose bg-bg text-[0.9rem]"
            />
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Votre message"
              maxLength={500}
              className="flex-1 min-w-[200px] px-3.5 py-2.5 border border-rose/30 rounded-[10px] outline-none focus:border-rose bg-bg text-[0.9rem]"
            />
            <button
              type="submit"
              disabled={sending}
              className="btn-grad rounded-[10px] px-5 py-2.5 text-[0.9rem] disabled:opacity-50"
            >
              {sending ? "Envoi…" : "Envoyer"}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="cursor-pointer text-xs px-3 py-2 rounded-[10px] border border-dashed border-rose/30 text-rose hover:bg-rose/5 transition">
                📷 {photos.length === 0 ? `Ajouter des photos souvenirs (${MAX_PHOTOS} max)` : "Ajouter"}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addPhotos(e.target.files)}
                />
              </label>
            )}
          </div>
        </form>

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        {notice && <p className="text-[#0F6E56] text-xs mt-2">{notice}</p>}
      </div>

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
    </section>
  );
}
