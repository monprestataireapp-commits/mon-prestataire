'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload, Loader2, Crown, GripVertical, ShoppingCart } from 'lucide-react'
import { getPhotoUrl } from '@/lib/photo'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

interface Photo { id: string; url: string; caption?: string | null; sortOrder: number }

interface Props {
  initialPhotos: Photo[]
  maxPhotos: number
  isPremium: boolean
}

export function PhotoManager({ initialPhotos, maxPhotos, isPremium }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [reordering, setReordering] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIndex = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    if (photos.length + files.length > maxPhotos) {
      toast(`Limite de ${maxPhotos} photos atteinte`, 'error')
      return
    }

    setUploading(true)
    let uploaded = 0
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/providers/photos', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) { toast(data.error || 'Erreur upload', 'error'); break }
        setPhotos(prev => [...prev, data.photo])
        uploaded++
      }
      if (uploaded > 0) toast(`${uploaded} photo${uploaded > 1 ? 's' : ''} ajoutée${uploaded > 1 ? 's' : ''} !`, 'success')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function deletePhoto(id: string) {
    const res = await fetch('/api/providers/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId: id }),
    })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== id))
      toast('Photo supprimée', 'info')
    }
  }

  function onDragStart(index: number) {
    dragIndex.current = index
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    dragOverIndex.current = index
  }

  async function onDrop() {
    const from = dragIndex.current
    const to = dragOverIndex.current
    if (from === null || to === null || from === to) return

    const next = [...photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setPhotos(next)

    dragIndex.current = null
    dragOverIndex.current = null

    setReordering(true)
    try {
      await fetch('/api/providers/photos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: next.map(p => p.id) }),
      })
    } catch {
      toast('Erreur lors de la réorganisation', 'error')
    } finally {
      setReordering(false)
    }
  }

  const remaining = maxPhotos - photos.length

  return (
    <div>
      {photos.length > 1 && (
        <p className="text-white/30 text-xs mb-3 flex items-center gap-1">
          <GripVertical size={12} /> Glissez pour réorganiser les photos
          {reordering && <Loader2 size={11} className="animate-spin ml-1" />}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={e => onDragOver(e, index)}
            onDrop={onDrop}
            className="relative aspect-square rounded-xl overflow-hidden group bg-dark cursor-grab active:cursor-grabbing"
          >
            <Image src={getPhotoUrl(photo.url)} alt={photo.caption || 'Photo'} fill className="object-cover" sizes="150px" />
            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => deletePhoto(photo.id)}
                className="w-8 h-8 rounded-full bg-rose/90 text-white flex items-center justify-center hover:bg-rose transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            {/* Badge ordre */}
            {index === 0 && (
              <div className="absolute top-1.5 left-1.5 bg-gold/80 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                1
              </div>
            )}
          </div>
        ))}

        {/* Bouton d'ajout */}
        {remaining > 0 && (
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className={cn(
              'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors',
              uploading ? 'border-rose/30 cursor-wait' : 'border-dark-border hover:border-rose/40 cursor-pointer'
            )}>
            {uploading ? (
              <Loader2 size={20} className="text-rose/60 animate-spin" />
            ) : (
              <>
                <Plus size={20} className="text-white/30" />
                <span className="text-xs text-white/30">{remaining} restante{remaining > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={upload} />

      {remaining > 0 && (
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="mt-4 flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <Upload size={15} />
          {uploading ? 'Upload en cours…' : `Ajouter des photos (${remaining} places disponibles)`}
        </button>
      )}

      {!isPremium && remaining === 0 && (
        <div className="mt-4 bg-dark border border-dark-border rounded-xl p-4 space-y-3">
          <p className="text-white/60 text-sm font-medium">Vous avez atteint la limite de 3 photos (offre Standard)</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/abonnement"
              className="flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-2.5 rounded-xl hover:bg-gold/20 transition-colors"
            >
              <Crown size={14} /> Passer en Premium — photos illimitées
            </a>
            <a
              href="mailto:contact@mon-prestataire.fr?subject=Ajout%20photos%20supplémentaires&body=Bonjour%2C%20je%20souhaite%20ajouter%20des%20photos%20supplémentaires%20à%20mon%20profil%20(0%2C50%20€%2Fphoto)."
              className="flex items-center gap-2 bg-dark-card border border-dark-border text-white/60 text-sm px-4 py-2.5 rounded-xl hover:border-rose/30 hover:text-white transition-colors"
            >
              <ShoppingCart size={14} /> Ajouter des photos — 0,50€/photo
            </a>
          </div>
          <p className="text-white/30 text-xs">Pour acheter des photos supplémentaires, contactez-nous par email.</p>
        </div>
      )}
    </div>
  )
}

