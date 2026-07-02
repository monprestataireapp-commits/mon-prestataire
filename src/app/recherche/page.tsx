'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SearchBar } from '@/components/search/SearchBar'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { CATEGORIES } from '@/lib/categories'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function RechercheContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const bienvenue = searchParams.get('bienvenue') === '1'
  const [showBienvenue, setShowBienvenue] = useState(bienvenue)

  const [providers, setProviders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: '',
    region: '',
    plan: '',
    verified: false,
    available: false,
    delivery: false,
    priceMax: '',
    sort: 'default',
  })

  const [loadingMore, setLoadingMore] = useState(false)

  function buildParams(f: typeof filters, p: number) {
    const params = new URLSearchParams()
    if (f.q) params.set('q', f.q)
    if (f.category) params.set('category', f.category)
    if (f.city) params.set('city', f.city)
    if (f.region) params.set('region', f.region)
    if (f.plan) params.set('plan', f.plan)
    if (f.verified) params.set('verified', 'true')
    if (f.available) params.set('available', 'true')
    if (f.delivery) params.set('delivery', 'true')
    if (f.priceMax) params.set('priceMax', f.priceMax)
    if (f.sort && f.sort !== 'default') params.set('sort', f.sort)
    params.set('page', String(p))
    params.set('limit', '12')
    return params
  }

  const fetchProviders = useCallback(async (f = filters, p = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/providers?${buildParams(f, p)}`)
      const data = await res.json()
      setProviders(data.providers || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(1)
    } finally {
      setLoading(false)
    }
  }, [filters])

  async function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/providers?${buildParams(filters, nextPage)}`)
      const data = await res.json()
      setProviders(prev => [...prev, ...(data.providers || [])])
      setPage(nextPage)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => { fetchProviders() }, [])

  function applyFilters(newFilters = filters) {
    setFilters(newFilters)
    fetchProviders(newFilters, 1)
    const params = new URLSearchParams()
    if (newFilters.q) params.set('q', newFilters.q)
    if (newFilters.category) params.set('category', newFilters.category)
    router.push(`/recherche?${params}`, { scroll: false })
  }

  function setFilter(key: string, value: any) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    applyFilters(next)
  }

  const activeFiltersCount = [filters.category, filters.city, filters.region, filters.plan, filters.verified, filters.available, filters.delivery, filters.priceMax].filter(Boolean).length

  return (
    <div className="min-h-screen">
      {/* Message bienvenue après inscription cliente */}
      {showBienvenue && (
        <div className="bg-rose/10 border-b border-rose/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-white text-sm">
              🎉 <strong>Bienvenue sur MonPrestataire !</strong> Votre compte a été créé. Explorez nos prestataires et trouvez la perle rare pour votre événement.
            </p>
            <button onClick={() => setShowBienvenue(false)} className="text-white/50 hover:text-white shrink-0 text-lg leading-none">✕</button>
          </div>
        </div>
      )}

      {/* Header recherche */}
      <div className="bg-dark-card border-b border-dark-border py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <SearchBar className="max-w-3xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Catégories pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            onClick={() => setFilter('category', '')}
            className={cn('shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border',
              !filters.category ? 'bg-rose border-rose text-white' : 'border-dark-border text-white/60 hover:border-rose/30 hover:text-white'
            )}
          >
            Toutes
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setFilter('category', filters.category === cat.slug ? '' : cat.slug)}
              className={cn('shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors border whitespace-nowrap',
                filters.category === cat.slug ? 'bg-rose border-rose text-white' : 'border-dark-border text-white/60 hover:border-rose/30 hover:text-white'
              )}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Barre filtres */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <p className="text-white/50 text-sm">
              {loading ? 'Recherche…' : `${total} prestataire${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
            </p>
            {filters.q && (
              <span className="text-sm text-white">pour &ldquo;<span className="text-rose">{filters.q}</span>&rdquo;</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.sort}
              onChange={e => setFilter('sort', e.target.value)}
              className="bg-dark border border-dark-border text-white/60 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-rose/40 cursor-pointer"
            >
              <option value="default">Pertinence</option>
              <option value="views">Plus populaires</option>
              <option value="recent">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors',
                filtersOpen || activeFiltersCount > 0 ? 'border-rose/40 text-rose bg-rose/5' : 'border-dark-border text-white/60 hover:border-rose/30'
              )}
            >
              <SlidersHorizontal size={15} />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="bg-rose text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Panneau filtres */}
        {filtersOpen && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Ville</label>
              <input
                value={filters.city}
                onChange={e => setFilter('city', e.target.value)}
                placeholder="Ex: Paris, Lyon…"
                className="input-dark text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Budget max (€)</label>
              <select
                value={filters.priceMax}
                onChange={e => setFilter('priceMax', e.target.value)}
                className="input-dark text-sm bg-dark-card"
              >
                <option value="">Tous budgets</option>
                <option value="50">Jusqu&apos;à 50€</option>
                <option value="100">Jusqu&apos;à 100€</option>
                <option value="200">Jusqu&apos;à 200€</option>
                <option value="500">Jusqu&apos;à 500€</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Formule</label>
              <select
                value={filters.plan}
                onChange={e => setFilter('plan', e.target.value)}
                className="input-dark text-sm bg-dark-card"
              >
                <option value="">Toutes</option>
                <option value="premium">Premium uniquement</option>
                <option value="standard">Standard</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { key: 'verified', label: '✅ Prestataires vérifiés uniquement' },
                { key: 'available', label: '🟢 Disponibles aujourd\'hui' },
                { key: 'delivery', label: '🚚 Livraison disponible' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters as any)[f.key]}
                    onChange={e => setFilter(f.key, e.target.checked)}
                    className="w-4 h-4 accent-rose rounded"
                  />
                  <span className="text-sm text-white/70">{f.label}</span>
                </label>
              ))}
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const reset = { ...filters, city: '', region: '', plan: '', verified: false, available: false, delivery: false }
                  setFilters(reset)
                  applyFilters(reset)
                }}
                className="flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors"
              >
                <X size={13} /> Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Grille prestataires */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border">
                <div className="skeleton h-52" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-5 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-3 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="font-cormorant text-2xl text-white mb-2">Aucun résultat</h3>
            <p className="text-white/40 text-sm">Essayez d&apos;élargir votre recherche ou de changer de catégorie.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
            </div>

            {/* Load more */}
            {page < pages && (
              <div className="flex flex-col items-center gap-2 mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-secondary flex items-center gap-2 px-8"
                >
                  {loadingMore ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {loadingMore ? 'Chargement…' : 'Voir plus de prestataires'}
                </button>
                <p className="text-white/30 text-xs">
                  {providers.length} / {total} prestataires
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function RecherchePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="skeleton w-full h-96 rounded-2xl max-w-2xl mx-auto" /></div>}>
      <RechercheContent />
    </Suspense>
  )
}

