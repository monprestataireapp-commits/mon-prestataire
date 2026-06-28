'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface SearchResult {
  id: string
  slug: string
  businessName: string
  city: string
  profilePhoto?: string | null
  categories: string[]
  avgRating?: number | null
}

interface Intent {
  city?: string | null
  category?: string | null
}

export function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [intent, setIntent] = useState<Intent>({})
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function search(q: string) {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.providers || [])
      setIntent(data.intent || {})
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => search(val), 350)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    const params = new URLSearchParams()
    if (intent.category) {
      // On a détecté une catégorie : naviguer vers la page catégorie ou recherche filtrée
      const cat = query.trim()
      params.set('q', cat)
      if (intent.city) params.set('city', intent.city)
    } else {
      params.set('q', query.trim())
    }
    router.push(`/recherche?${params}`)
  }

  const placeholders = [
    'Maquilleuse Paris mariage…',
    'Photographe Marseille…',
    'Gâteau anniversaire Lyon…',
    'DJ oriental soirée…',
    'Décoratrice mariage Bordeaux…',
  ]
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Sparkles size={16} className="text-rose" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-dark-card/80 backdrop-blur border border-dark-border/80 text-white placeholder-white/30 rounded-2xl pl-11 pr-32 py-4 text-sm focus:outline-none focus:border-rose/50 focus:shadow-lg focus:shadow-rose/10 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
                className="text-white/30 hover:text-white p-1">
                <X size={15} />
              </button>
            )}
            <button type="submit"
              className="flex items-center gap-2 bg-rose hover:bg-rose-dark text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              <span className="hidden sm:inline">Rechercher</span>
            </button>
          </div>
        </div>
      </form>

      {/* Dropdown résultats */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50">
          {(intent.city || intent.category) && (
            <div className="px-4 py-2 border-b border-dark-border flex items-center gap-2 text-xs text-white/40">
              <Sparkles size={11} className="text-rose" />
              Recherche détectée :
              {intent.category && <span className="text-rose">{intent.category}</span>}
              {intent.city && <span className="text-rose capitalize">{intent.city}</span>}
            </div>
          )}
          {results.map(r => (
            <a
              key={r.id}
              href={`/prestataire/${r.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark transition-colors border-b border-dark-border last:border-0"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-dark">
                {r.profilePhoto && (
                  <Image src={r.profilePhoto} alt={r.businessName} width={40} height={40} className="object-cover w-full h-full" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{r.businessName}</p>
                <p className="text-white/40 text-xs truncate">{r.city} · {r.categories.slice(0, 2).join(', ')}</p>
              </div>
              {r.avgRating && (
                <span className="text-xs text-gold shrink-0">★ {r.avgRating}</span>
              )}
            </a>
          ))}
          <button
            onClick={handleSubmit as any}
            className="w-full text-center py-3 text-sm text-rose hover:text-rose-dark transition-colors font-medium"
          >
            Voir tous les résultats pour &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  )
}

