'use client'

import { useState } from 'react'
import { X, Send, CheckCircle } from 'lucide-react'

interface Props {
  providerId: string
  providerName: string
  onClose: () => void
}

export function DevisModal({ providerId, providerName, onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    message: '',
    budget: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Veuillez remplir les champs obligatoires.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, providerId }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const d = await res.json()
        setError(d.error || 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-card border border-dark-border rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="font-cormorant text-xl font-bold text-white">Demande de devis</h2>
            <p className="text-white/40 text-xs">{providerName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="font-cormorant text-2xl font-bold text-white mb-2">Demande envoyée !</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {providerName} a reçu votre demande de devis. Vous serez contacté(e) rapidement.
            </p>
            <button onClick={onClose} className="btn-primary w-full">Fermer</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">Votre nom *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Marie D." required
                  className="input-field w-full text-sm" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Téléphone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="06 xx xx xx xx" type="tel"
                  className="input-field w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Email *</label>
              <input value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="votre@email.fr" type="email" required
                className="input-field w-full text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block">Date de l&apos;événement</label>
                <input value={form.eventDate} onChange={e => set('eventDate', e.target.value)}
                  type="date" className="input-field w-full text-sm" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Budget estimé</label>
                <select value={form.budget} onChange={e => set('budget', e.target.value)}
                  className="input-field w-full text-sm">
                  <option value="">Non défini</option>
                  <option value="moins_50">Moins de 50€</option>
                  <option value="50_150">50€ – 150€</option>
                  <option value="150_300">150€ – 300€</option>
                  <option value="300_500">300€ – 500€</option>
                  <option value="plus_500">Plus de 500€</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Message *</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Décrivez votre projet, la date, le lieu, le nombre de personnes..." required
                rows={4} className="input-field w-full text-sm resize-none" />
            </div>
            {error && <p className="text-rose text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              <Send size={15} /> {loading ? 'Envoi…' : 'Envoyer la demande'}
            </button>
            <p className="text-white/30 text-xs text-center">
              Votre demande est envoyée directement au prestataire
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

