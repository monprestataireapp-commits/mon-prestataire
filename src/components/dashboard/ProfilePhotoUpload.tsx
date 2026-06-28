'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'

interface Props {
  currentUrl?: string | null
  type: 'profile' | 'cover'
  size?: number
  onUploaded?: (url: string) => void
}

export function ProfilePhotoUpload({ currentUrl, type, size = 80, onUploaded }: Props) {
  const [url, setUrl] = useState(currentUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const res = await fetch('/api/providers/profile-photo', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      setUrl(data.url)
      onUploaded?.(data.url)
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (type === 'cover') {
    return (
      <div className="relative h-40 bg-dark border border-dark-border rounded-2xl overflow-hidden group cursor-pointer"
        onClick={() => fileRef.current?.click()}>
        {url ? (
          <Image src={url} alt="Photo de couverture" fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white/30 text-sm">Cliquez pour ajouter une photo de couverture</p>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark/40">
          {loading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
        {error && <p className="absolute bottom-2 left-2 text-rose text-xs bg-dark/80 px-2 py-1 rounded">{error}</p>}
      </div>
    )
  }

  return (
    <div className="relative cursor-pointer" style={{ width: size, height: size }}
      onClick={() => fileRef.current?.click()}>
      <div className={`rounded-2xl overflow-hidden bg-dark border border-dark-border`} style={{ width: size, height: size }}>
        {url ? (
          <Image src={url} alt="Photo de profil" width={size} height={size} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose/30 to-gold/30 flex items-center justify-center">
            <Camera size={size / 3} className="text-white/50" />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rose border-2 border-dark flex items-center justify-center">
        {loading ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
      {error && <p className="absolute -bottom-5 left-0 text-rose text-xs whitespace-nowrap">{error}</p>}
    </div>
  )
}

