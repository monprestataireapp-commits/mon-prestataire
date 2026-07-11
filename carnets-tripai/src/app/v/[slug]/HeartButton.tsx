"use client";

import { useState, useEffect } from "react";

export default function HeartButton({
  etapeId,
  initialCount,
  reactionId,
}: {
  etapeId: string;
  initialCount: number;
  reactionId?: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const key = `heart-${etapeId}`;
    setLiked(localStorage.getItem(key) === "1");
  }, [etapeId]);

  async function toggle() {
    const key = `heart-${etapeId}`;
    if (liked) return;
    setLiked(true);
    setCount((c) => c + 1);
    localStorage.setItem(key, "1");
    await fetch(`/api/reactions/${reactionId || etapeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etapeId }),
    });
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
        liked
          ? "bg-rose text-white border-rose"
          : "bg-white text-rose border-rose/30 hover:bg-rose/5 active:scale-95"
      }`}
    >
      ♥ <span>{count}</span>
    </button>
  );
}
