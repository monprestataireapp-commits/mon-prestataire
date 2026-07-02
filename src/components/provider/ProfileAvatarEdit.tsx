'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { getPhotoUrl } from '@/lib/photo'

interface Props {
  currentPhoto?: string | null
  businessName: string
  isOwner?: boolean
}

export function ProfileAvatarEdit({ currentPhoto, businessName, isOwner }: Props) {
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
      formData.append('type', 'profile')
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
      className={`relative w-24 h-24 rounded-2xl border-4 border-dark-card overflow-hidden shrink-0 bg-dark group ${isOwner ? 'cursor-pointer' : ''}`}
      onClick={() => isOwner && fileRef.current?.click()}
    >
      {url ? (
        <Image src={getPhotoUrl(url)} alt={businessName} width={96} height={96} className="object-cover w-full h-full" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-rose to-gold flex items-center justify-center text-3xl text-white font-bold font-cormorant">
          {businessName[0]}
        </div>
      )}

      {isOwner && (
        <>
          <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {loading
              ? <Loader2 size={20} className="text-white animate-spin" />
              : <Camera size={20} className="text-white" />
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
        </>
      )}
    </div>
  )
}
