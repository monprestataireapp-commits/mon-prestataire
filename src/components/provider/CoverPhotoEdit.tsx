'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { getPhotoUrl } from '@/lib/photo'

interface Props {
  currentPhoto?: string | null
  fallback: string
  isOwner?: boolean
}

export function CoverPhotoEdit({ currentPhoto, fallback, isOwner }: Props) {
  const [url, setUrl] = useState(currentPhoto || '')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'cover')
      const res = await fetch('/api/providers/profile-photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) setUrl(data.url)
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div
      className={`relative h-48 sm:h-64 group ${isOwner ? 'cursor-pointer' : ''}`}
      onClick={() => isOwner && fileRef.current?.click()}
    >
      <Image
        src={getPhotoUrl(url || '', fallback)}
        alt="Photo de couverture"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/20 to-transparent" />
      {isOwner && (
        <>
          <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
            {loading
              ? <Loader2 size={24} className="text-white animate-spin" />
              : <><Camera size={20} className="text-white" /><span className="text-white text-sm font-medium">Modifier la couverture</span></>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
        </>
      )}
    </div>
  )
}
