"use client";

import { useState } from "react";

type Msg = { id: string; prenom: string; message: string };

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!prenom.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    const r = await fetch(`/api/carnets/${carnetId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom: prenom.trim(), message: message.trim() }),
    });
    if (r.ok) {
      const msg = await r.json();
      setMessages((prev) => [...prev, msg]);
      setPrenom("");
      setMessage("");
    } else {
      const data = await r.json();
      setError(data.error || "Erreur");
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
          </div>
        ))}
        <form onSubmit={submit} className="flex gap-2 mt-4 flex-wrap">
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
            {sending ? "…" : "Envoyer"}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    </section>
  );
}
