'use client'

import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'

interface StatPoint {
  label: string
  views: number
  clicks: number
}

export function DashboardStats({ providerId }: { providerId: string }) {
  const [data, setData] = useState<StatPoint[]>([])
  const [mode, setMode] = useState<'views' | 'clicks'>('views')
  const [loading, setLoading] = useState(true)
  const [hasRealData, setHasRealData] = useState(false)
  const [totals, setTotals] = useState({ views: 0, clicks: 0 })

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => {
        setData(d.stats || [])
        setHasRealData(d.hasRealData || false)
        setTotals({ views: d.totalViews || 0, clicks: d.totalClicks || 0 })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-48 skeleton rounded-xl" />
  if (!data.length) return <p className="text-white/30 text-sm">Aucune donnée disponible.</p>

  const values = data.map(d => mode === 'views' ? d.views : d.clicks)
  const max = Math.max(...values, 1)

  return (
    <div>
      {/* Totaux */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-dark rounded-xl p-3">
          <p className="font-cormorant text-2xl font-bold text-white">{totals.views.toLocaleString('fr-FR')}</p>
          <p className="text-white/40 text-xs">Vues totales</p>
        </div>
        <div className="bg-dark rounded-xl p-3">
          <p className="font-cormorant text-2xl font-bold text-white">{totals.clicks.toLocaleString('fr-FR')}</p>
          <p className="text-white/40 text-xs">Clics totaux</p>
        </div>
      </div>

      {/* Toggle mode */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {(['views', 'clicks'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${mode === m ? 'bg-rose text-white' : 'bg-dark border border-dark-border text-white/50 hover:text-white'}`}>
              {m === 'views' ? 'Vues / mois' : 'Clics / mois'}
            </button>
          ))}
        </div>
        {!hasRealData && (
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <Info size={11} /> Données estimées
          </div>
        )}
      </div>

      {/* Graphique barres */}
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
          const val = mode === 'views' ? d.views : d.clicks
          const pct = (val / max) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="text-xs text-white/0 group-hover:text-white/70 transition-colors whitespace-nowrap">
                {val.toLocaleString('fr-FR')}
              </div>
              <div className="w-full rounded-t-lg bg-gradient-to-t from-rose to-rose-light/60 transition-all duration-700"
                style={{ height: `${Math.max(pct, 3)}%` }} />
              <span className="text-xs text-white/30">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

