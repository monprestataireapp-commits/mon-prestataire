'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CATEGORIES } from '@/lib/categories'

const MapClient = dynamic(() => import('./MapClient'), { ssr: false, loading: () => (
  <div className="w-full h-[600px] rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
    <p className="text-white/40 text-sm">Chargement de la carte…</p>
  </div>
) })

export function MapView() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetch('/api/map/providers')
      .then(r => r.json())
      .then(d => { setProviders(d.providers || []); setLoading(false) })
  }, [])

  const filtered = selectedCategory === 'all'
    ? providers
    : providers.filter(p => p.categories?.[0]?.category?.slug === selectedCategory)

  const usedCategorySlugs = new Set(providers.map(p => p.categories?.[0]?.category?.slug).filter(Boolean))
  const usedCategories = CATEGORIES.filter(c => usedCategorySlugs.has(c.slug))

  return (
    <div className="space-y-4">
      {/* Filtres catégories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            selectedCategory === 'all'
              ? 'bg-rose/20 border-rose/40 text-rose'
              : 'border-dark-border text-white/50 hover:border-rose/30 hover:text-white'
          }`}
        >
          Toutes ({providers.length})
        </button>
        {usedCategories.map(cat => {
          const count = providers.filter(p => p.categories?.[0]?.category?.slug === cat.slug).length
          return (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-rose/20 border-rose/40 text-rose'
                  : 'border-dark-border text-white/50 hover:border-rose/30 hover:text-white'
              }`}
            >
              {cat.emoji} {cat.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Carte */}
      {loading ? (
        <div className="w-full h-[600px] rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
          <p className="text-white/40 text-sm">Chargement…</p>
        </div>
      ) : (
        <MapClient providers={filtered} />
      )}

      <p className="text-white/20 text-xs text-center">
        {filtered.length} prestataire{filtered.length > 1 ? 's' : ''} sur la carte
      </p>
    </div>
  )
}
