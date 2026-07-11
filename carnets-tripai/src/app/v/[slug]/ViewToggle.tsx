"use client";

import { useState } from "react";

export default function ViewToggle({
  blogView,
  bookView,
}: {
  blogView: React.ReactNode;
  bookView: React.ReactNode;
}) {
  const [mode, setMode] = useState<"blog" | "livre">("blog");

  return (
    <>
      {/* Floating toggle */}
      <div className="fixed top-16 right-4 z-50 flex bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-[#C8748A]/15 p-1 text-xs font-medium">
        <button
          onClick={() => setMode("blog")}
          className={`px-3.5 py-1.5 rounded-full transition ${
            mode === "blog"
              ? "bg-[#C8748A] text-white"
              : "text-[#8A7080] hover:text-[#2D1B25]"
          }`}
        >
          Blog
        </button>
        <button
          onClick={() => setMode("livre")}
          className={`px-3.5 py-1.5 rounded-full transition ${
            mode === "livre"
              ? "bg-[#C8748A] text-white"
              : "text-[#8A7080] hover:text-[#2D1B25]"
          }`}
        >
          Livre
        </button>
      </div>

      {mode === "blog" ? blogView : bookView}
    </>
  );
}
