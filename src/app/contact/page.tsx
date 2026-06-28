'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Mail, MessageSquare } from 'lucide-react'

const SUBJECTS = [
  'Question sur mon abonnement',
  'Problème technique',
  'Signaler un prestataire',
  'Partenariat / Presse',
  'Autre',
]

const CONTACTS = [
  { title: 'Support prestataires', email: 'prestataires@mon-prestataire.fr', desc: 'Inscription, abonnement, problèmes de profil' },
  { title: 'Support clients', email: 'contact@mon-prestataire.fr', desc: 'Questions générales, avis, signalements' },
  { title: 'Partenariats & Presse', email: 'partenariats@mon-prestataire.fr', desc: 'Collaboration, médias, événements' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) { setForm(prev => ({ ...prev, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur lors de l\'envoi'); return }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-3">
          Nous <span className="text-gradient-rose-gold">contacter</span>
        </h1>
        <p className="text-white/50 text-base max-w-md mx-auto">
          Une question, un problème ou une demande ? Notre équipe vous répond sous 24h.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-green-400/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <h2 className="font-cormorant text-2xl font-bold text-white mb-2">Message envoyé !</h2>
              <p className="text-white/40 text-sm">
                Merci, nous avons bien reçu votre message. Notre équipe vous répondra sous 24h à l'adresse <strong className="text-white/60">{form.email}</strong>.
              </p>
              <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                className="btn-secondary mt-6 text-sm">
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Votre nom *</label>
                  <input
                    type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Prénom Nom"
                    className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose/40"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Email *</label>
                  <input
                    type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="vous@email.fr"
                    className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">Sujet</label>
                <select value={form.subject} onChange={e => set('subject', e.target.value)}
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose/40">
                  <option value="">Choisissez un sujet…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">Message *</label>
                <textarea
                  required value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder="Décrivez votre demande en détail…"
                  rows={5}
                  minLength={20}
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose/40 resize-none"
                />
              </div>

              {error && (
                <div className="bg-rose/10 border border-rose/20 rounded-xl p-3 text-rose text-sm">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Send size={14} />
                {loading ? 'Envoi en cours…' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </div>

        {/* Contacts + FAQ */}
        <div className="space-y-4">
          <div className="grid gap-3">
            {CONTACTS.map(c => (
              <div key={c.email} className="bg-dark-card border border-dark-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={15} className="text-rose" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm mb-0.5">{c.title}</p>
                    <a href={`mailto:${c.email}`} className="text-rose text-sm hover:underline">{c.email}</a>
                    <p className="text-white/40 text-xs mt-1">{c.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-gold" />
              <h2 className="font-cormorant text-xl font-semibold text-white">FAQ rapide</h2>
            </div>
            <div className="space-y-4">
              {[
                { q: 'Comment référencer mon activité ?', a: 'Cliquez sur "Devenir prestataire" et suivez les 5 étapes d\'inscription. Votre profil est actif dès la souscription d\'un abonnement.' },
                { q: 'Puis-je annuler mon abonnement ?', a: 'Oui, depuis votre tableau de bord → "Mon abonnement". L\'engagement minimum est de 12 mois pour la formule mensuelle.' },
                { q: 'Comment signaler un prestataire ?', a: 'Utilisez le formulaire ci-contre avec le sujet "Signaler un prestataire" ou écrivez à contact@mon-prestataire.fr.' },
              ].map(faq => (
                <div key={faq.q} className="border-b border-dark-border pb-4 last:border-0 last:pb-0">
                  <p className="text-white text-sm font-medium mb-1">{faq.q}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

