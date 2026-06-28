'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  caption?: string | null
}

interface Props {
  photos: Photo[]
  businessName: string
}

export function PhotoLightbox({ photos, businessName }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  function prev() { setIndex(i => (i - 1 + photos.length) % photos.length) }
  function next() { setIndex(i => (i + 1) % photos.length) }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button key={photo.id} onClick={() => { setIndex(i); setOpen(true) }}
            className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-rose">
            <Image src={photo.url} alt={photo.caption || businessName} fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 33vw" />
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors" />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setOpen(false)} onKeyDown={handleKey} tabIndex={0}>
          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12"
            onClick={e => e.stopPropagation()}>
            <div className="relative max-w-4xl max-h-full w-full h-full">
              <Image src={photos[index].url} alt={photos[index].caption || businessName}
                fill className="object-contain" sizes="100vw" />
            </div>

            {/* Caption */}
            {photos[index].caption && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark/80 rounded-xl px-4 py-2 text-white/70 text-sm text-center max-w-xs">
                {photos[index].caption}
              </div>
            )}
          </div>

          {/* Controls */}
          <button onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-white/70 hover:text-white transition-colors z-10">
            <X size={18} />
          </button>

          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-white/70 hover:text-white transition-colors z-10">
                <ChevronLeft size={18} />
              </button>
              <button onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-card border border-dark-border flex items-center justify-center text-white/70 hover:text-white transition-colors z-10">
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-dark/80 rounded-full px-3 py-1 text-white/50 text-xs z-10">
            {index + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}

