'use client'

import { useState, useRef } from 'react'
import { Video, Plus, Trash2, Upload, Lock } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ProviderVideo { id: string; url: string; caption?: string | null }

interface Props {
  initialVideos: ProviderVideo[]
  isPremium: boolean
}

export function VideoManager({ initialVideos, isPremium }: Props) {
  const [videos, setVideos] = useState(initialVideos)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const maxVideos = isPremium ? 5 : 2

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (videos.length >= maxVideos) {
      toast(`Maximum ${maxVideos} vidéos atteint`, 'error')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('video', file)
      fd.append('caption', caption)
      const res = await fetch('/api/providers/videos', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setVideos(v => [...v, data.video])
        setCaption('')
        toast('Vidéo ajoutée !', 'success')
      } else {
        toast(data.error || 'Erreur upload', 'error')
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function deleteVideo(id: string) {
    const res = await fetch('/api/providers/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: id }),
    })
    if (res.ok) {
      setVideos(v => v.filter(x => x.id !== id))
      toast('Vidéo supprimée', 'info')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-rose" />
          <span className="text-white/60 text-sm">{videos.length}/{maxVideos} vidéos</span>
          {!isPremium && (
            <span className="flex items-center gap-1 text-xs text-gold/70">
              <Lock size={11} /> 5 vidéos avec Premium
            </span>
          )}
        </div>
      </div>

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {videos.map(v => (
            <div key={v.id} className="relative bg-dark rounded-xl overflow-hidden border border-dark-border group">
              <video src={v.url} controls className="w-full aspect-video object-cover" preload="metadata" />
              {v.caption && (
                <p className="text-white/50 text-xs px-3 py-2">{v.caption}</p>
              )}
              <button
                onClick={() => deleteVideo(v.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose/80 hover:bg-rose flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={13} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {videos.length < maxVideos ? (
        <div className="space-y-3">
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Légende (optionnel)"
            className="input-field w-full text-sm"
          />
          <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-dark-border rounded-xl p-6 cursor-pointer hover:border-rose/40 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleUpload} />
            {uploading ? (
              <span className="flex items-center gap-2 text-white/50 text-sm">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Upload en cours…
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white/40 text-sm">
                <Upload size={16} /> Ajouter une vidéo (MP4, WebM, MOV — max 50 Mo)
              </span>
            )}
          </label>
        </div>
      ) : (
        <p className="text-white/30 text-sm text-center py-4">
          Limite de {maxVideos} vidéos atteinte.
          {!isPremium && <span className="text-gold"> Passez Premium pour en ajouter jusqu'à 5.</span>}
        </p>
      )}
    </div>
  )
}

