"use client";

import { useState } from "react";

type Props = {
  photos: { id: string; url: string; ordre: number }[];
};

export default function PhotoGallery({ photos }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  function openAt(index: number) {
    setCurrent(index);
    setOpen(true);
  }

  if (photos.length === 0) return null;

  const shadow = "shadow-[0_4px_24px_rgba(200,116,138,0.12)]";

  return (
    <>
      {/* Grid preview */}
      {photos.length === 1 && (
        <div className="mb-4 cursor-pointer" onClick={() => openAt(0)}>
          <img
            src={photos[0].url}
            alt=""
            className={`w-full h-[340px] object-cover rounded-[14px] ${shadow}`}
          />
        </div>
      )}
      {photos.length === 2 && (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {photos.map((p, i) => (
            <img
              key={p.id}
              src={p.url}
              alt=""
              onClick={() => openAt(i)}
              className={`w-full h-[240px] object-cover rounded-[14px] ${shadow} cursor-pointer`}
            />
          ))}
        </div>
      )}
      {photos.length >= 3 && (
        <div className="grid grid-cols-[2fr_1fr] gap-2.5 mb-4">
          <img
            src={photos[0].url}
            alt=""
            onClick={() => openAt(0)}
            className={`w-full h-[320px] object-cover rounded-[14px] ${shadow} cursor-pointer`}
          />
          <div className="grid gap-2.5">
            <img
              src={photos[1].url}
              alt=""
              onClick={() => openAt(1)}
              className={`w-full h-[155px] object-cover rounded-[14px] ${shadow} cursor-pointer`}
            />
            {photos.length === 3 ? (
              <img
                src={photos[2].url}
                alt=""
                onClick={() => openAt(2)}
                className={`w-full h-[155px] object-cover rounded-[14px] ${shadow} cursor-pointer`}
              />
            ) : (
              <div
                className="relative rounded-[14px] overflow-hidden cursor-pointer"
                onClick={() => openAt(2)}
              >
                <img
                  src={photos[2].url}
                  alt=""
                  className="w-full h-[155px] object-cover brightness-[0.55]"
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold font-syne text-lg">
                  +{photos.length - 2} photos
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10"
          >
            ✕
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((current - 1 + photos.length) % photos.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl z-10"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((current + 1) % photos.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl z-10"
              >
                ›
              </button>
            </>
          )}

          <img
            src={photos[current].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          />

          <div className="absolute bottom-4 text-white/60 text-sm">
            {current + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
