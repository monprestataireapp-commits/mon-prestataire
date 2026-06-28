'use client'

import { useState, useEffect } from 'react'
import { Send, Calendar, Phone, Mail, ChevronDown, ChevronUp, Clock } from 'lucide-react'

const BUDGET_LABELS: Record<string, string> = {
  moins_50: 'Moins de 50€',
  '50_150': '50€ – 150€',
  '150_300': '150€ – 300€',
  '300_500': '300€ – 500€',
  plus_500: 'Plus de 500€',
}

function isRecent(date: string) {
  return Date.now() - new Date(date).getTime() < 48 * 60 * 60 * 1000
}

export function DevisList() {
  const [devis, setDevis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/devis')
      .then(r => r.json())
      .then(d => setDevis(d.devis || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    )
  }

  if (devis.length === 0) {
    return (
      <div className="text-center py-10">
        <Send size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">Les demandes de devis des clients apparaîtront ici.</p>
      </div>
    )
  }

  const newCount = devis.filter(d => isRecent(d.createdAt)).length

  return (
    <div>
      {newCount > 0 && (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-rose/10 border border-rose/20 text-rose text-xs font-medium px-3 py-1.5 rounded-full">
          <Clock size={11} /> {newCount} nouvelle{newCount > 1 ? 's' : ''} demande{newCount > 1 ? 's' : ''} (48h)
        </div>
      )}
      <div className="space-y-2">
        {devis.map((d: any) => {
          const open = expanded === d.id
          const recent = isRecent(d.createdAt)
          return (
            <div key={d.id} className={`border rounded-2xl transition-colors ${recent ? 'border-rose/30 bg-rose/5' : 'border-dark-border bg-dark'}`}>
              <button
                onClick={() => setExpanded(open ? null : d.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose to-gold flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {d.contactName?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{d.contactName}</span>
                      {recent && (
                        <span className="text-xs bg-rose text-white rounded-full px-1.5 py-0.5 leading-none">Nouveau</span>
                      )}
                      {d.budget && (
                        <span className="text-xs text-gold">{BUDGET_LABELS[d.budget] || d.budget}</span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{d.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white/30 text-xs">
                    {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                  {open ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                </div>
              </button>

              {open && (
                <div className="px-4 pb-4 border-t border-dark-border pt-4">
                  <p className="text-white/70 text-sm leading-relaxed mb-4 whitespace-pre-line">{d.description}</p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {d.eventDate && (
                      <span className="flex items-center gap-1.5 text-xs text-white/50">
                        <Calendar size={12} />
                        {new Date(d.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    {d.contactPhone && (
                      <a href={`tel:${d.contactPhone}`}
                        className="flex items-center gap-1.5 text-xs text-white/60 hover:text-rose transition-colors">
                        <Phone size={12} /> {d.contactPhone}
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {d.contactEmail && (
                      <a
                        href={`mailto:${d.contactEmail}?subject=Réponse à votre demande de devis&body=Bonjour ${d.contactName},%0A%0AMerci pour votre demande de devis. Je reviens vers vous concernant votre projet.%0A%0A`}
                        className="flex items-center gap-2 bg-rose hover:bg-rose-dark text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        <Mail size={13} /> Répondre par email
                      </a>
                    )}
                    {d.contactPhone && (
                      <a
                        href={`tel:${d.contactPhone}`}
                        className="flex items-center gap-2 bg-dark border border-dark-border hover:border-rose/30 text-white/70 hover:text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        <Phone size={13} /> Appeler
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

