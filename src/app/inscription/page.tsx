'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { CATEGORIES } from '@/lib/categories'
import { SPECIALTIES } from '@/lib/specialties'
import { DEPARTMENTS_FRANCE, REGIONS_FRANCE } from '@/lib/utils'
import { EUROPEAN_COUNTRIES, REGIONS_BY_COUNTRY } from '@/lib/regions-europe'
import { Check, ChevronRight, ChevronLeft, Zap, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Compte', 'Profil', 'Localisation', 'Livraison', 'Catégories', 'Spécialités']

export default function InscriptionPage() {
  const router = useRouter()
  

    // Capturer le code de parrainage depuis l'URL
    useEffect(() => {
          const ref = new URLSearchParams(window.location.search).get('ref')
          if (ref) {
                  document.cookie = `ref=${ref}; path=/; max-age=2592000`
          }
    }, [])
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foundingCount, setFoundingCount] = useState<number | null>(null)

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '',
    businessName: '', description: '', phone: '', phonePublic: false, instagramUrl: '', tiktokUrl: '', website: '',
    yearsExperience: '',
    country: 'FR', city: '', region: '', department: '', departmentCode: '',
    hasDelivery: false, deliveryZone: '', deliveryFee: '', hasHandDelivery: false,
    priceMin: '', priceMax: '',
    categories: [] as string[],
    specialties: [] as string[],
  })

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleCategory(slug: string) {
    const newCats = form.categories.includes(slug)
      ? form.categories.filter(s => s !== slug)
      : [...form.categories, slug]
    // Retirer les spécialités des catégories désélectionnées
    const validSpecialties = form.specialties.filter(sp =>
      newCats.some(cat => SPECIALTIES[cat]?.includes(sp))
    )
    setForm(f => ({ ...f, categories: newCats, specialties: validSpecialties }))
  }

  function toggleSpecialty(sp: string) {
    set('specialties', form.specialties.includes(sp)
      ? form.specialties.filter(s => s !== sp)
      : [...form.specialties, sp]
    )
  }

  // Spécialités disponibles selon les catégories sélectionnées
  const availableSpecialties = form.categories.flatMap(cat => {
    const specs = SPECIALTIES[cat] ?? []
    return specs.map(sp => ({ label: sp, category: cat }))
  }).filter((item, idx, arr) => arr.findIndex(x => x.label === item.label) === idx)

  const hasSpecialties = availableSpecialties.length > 0

  async function submitAndGoToAbonnement() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      // Inscription gratuite - rediriger vers le dashboard
      
      router.push('/dashboard?welcome=true')
      } finally {
      setLoading(false)
    }
  }

  async function subscribe() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: 'standard_monthly' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError('Erreur lors de la redirection vers le paiement')
    } finally {
      setLoading(false)
    }
  }

  // Étapes effectives : Spécialités sautée si aucune dispo, Abonnement toujours en dernier
  const baseSteps = hasSpecialties ? STEPS : STEPS.filter(s => s !== 'Spécialités')
  const stepLabels = baseSteps
  const totalSteps = stepLabels.length
  const isLastBeforeAbonnement = stepLabels[step] === (hasSpecialties ? 'Spécialités' : 'Catégories')
  const isAbonnementStep = stepLabels[step] === 'Abonnement'

  function next() {
    if (step === 0) {
      if (!form.email || !form.password) { setError('Champs obligatoires'); return }
      if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
      if (form.password.length < 8) { setError('Mot de passe trop court (8 caractères minimum)'); return }
    }
    if (step === 1 && !form.businessName) { setError('Nom de votre activité obligatoire'); return }
    if (stepLabels[step] === 'Catégories' && form.categories.length === 0) { setError('Sélectionnez au moins une catégorie'); return }
    setError('')
    if (isLastBeforeAbonnement) { submitAndGoToAbonnement(); return }
    if (step < totalSteps - 1) setStep(s => s + 1)
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-gradient-rose-gold mb-2">
            Devenir prestataire
          </h1>
          <p className="text-white/50 text-sm">Inscription 100% gratuite — Créez votre profil et rejoignez la communauté</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-border" />
          <div className="absolute top-4 left-0 h-0.5 bg-rose transition-all" style={{ width: `${(step / (stepLabels.length - 1)) * 100}%` }} />
          {stepLabels.map((s, i) => (
            <div key={s} className="relative flex flex-col items-center gap-2 z-10">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                i < step ? 'bg-rose text-white' : i === step ? 'bg-rose text-white ring-4 ring-rose/20' : 'bg-dark-card border border-dark-border text-white/30'
              )}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn('text-xs hidden sm:block', i === step ? 'text-white' : 'text-white/30')}>{s}</span>
            </div>
          ))}
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8">
          {/* Étape 0 : Compte */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-cormorant text-2xl font-semibold text-white mb-4">Créez votre compte</h2>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Votre prénom / nom</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input-dark" placeholder="Marie Dupont" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-dark" placeholder="votre@email.fr" required />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Mot de passe * (8 caractères minimum)</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input-dark" placeholder="••••••••" required />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Confirmer le mot de passe *</label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className="input-dark" placeholder="••••••••" required />
              </div>
            </div>
          )}

          {/* Étape 1 : Profil */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-cormorant text-2xl font-semibold text-white mb-4">Votre profil</h2>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Nom de votre activité *</label>
                <input value={form.businessName} onChange={e => set('businessName', e.target.value)} className="input-dark" placeholder="Ex : Sophia Beauté, Nassim Photography…" required />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Description (présentez votre activité)</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="input-dark resize-none" placeholder="Décrivez votre activité, vos spécialités, votre style…" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Téléphone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-dark" placeholder="06 00 00 00 00" />
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.phonePublic}
                    onChange={e => set('phonePublic', e.target.checked)}
                    className="w-4 h-4 accent-rose rounded"
                  />
                  <span className="text-xs text-white/50">Afficher mon numéro sur mon profil public</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Instagram</label>
                  <input value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} className="input-dark" placeholder="https://instagram.com/…" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">TikTok</label>
                  <input value={form.tiktokUrl} onChange={e => set('tiktokUrl', e.target.value)} className="input-dark" placeholder="https://tiktok.com/@…" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Années d&apos;expérience</label>
                <input type="number" min="0" max="50" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} className="input-dark" placeholder="Ex : 5" />
              </div>
            </div>
          )}

          {/* Étape 2 : Localisation */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-cormorant text-2xl font-semibold text-white mb-4">Votre localisation</h2>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Pays *</label>
                <select value={form.country} onChange={e => {
                  set('country', e.target.value)
                  set('region', '')
                  set('department', '')
                  set('departmentCode', '')
                }} className="input-dark bg-dark-card">
                  {EUROPEAN_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Ville *</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className="input-dark" placeholder="Paris, Lyon, Marseille…" />
              </div>
              {form.country === 'FR' && (
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Département</label>
                  <select value={form.departmentCode} onChange={e => {
                    const dept = DEPARTMENTS_FRANCE.find(d => d.code === e.target.value)
                    set('departmentCode', e.target.value)
                    set('department', dept?.name || '')
                    set('region', dept?.region || '')
                  }} className="input-dark bg-dark-card">
                    <option value="">Sélectionner un département</option>
                    {DEPARTMENTS_FRANCE.map(d => (
                      <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-white/50 mb-1 block">Région *</label>
                <select value={form.region} onChange={e => set('region', e.target.value)} className="input-dark bg-dark-card">
                  <option value="">Sélectionner une région</option>
                  {(REGIONS_BY_COUNTRY[form.country] || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Étape 3 : Livraison */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-cormorant text-2xl font-semibold text-white mb-4">Livraison & Remise</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasDelivery} onChange={e => set('hasDelivery', e.target.checked)} className="w-5 h-5 accent-rose rounded" />
                <span className="text-white">🚚 Je propose la livraison</span>
              </label>

              {form.hasDelivery && (
                <div className="pl-8 space-y-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Zone de livraison</label>
                    <select value={form.deliveryZone} onChange={e => set('deliveryZone', e.target.value)} className="input-dark bg-dark-card">
                      <option value="">Sélectionner</option>
                      <option value="france">France entière</option>
                      <option value="region">Ma région uniquement</option>
                      <option value="city">Ma ville uniquement</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Frais de livraison</label>
                    <select value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} className="input-dark bg-dark-card">
                      <option value="">Sélectionner</option>
                      <option value="gratuit">Gratuit</option>
                      <option value="5">À partir de 5€</option>
                      <option value="10">À partir de 10€</option>
                      <option value="selon_commande">Selon la commande</option>
                    </select>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input type="checkbox" checked={form.hasHandDelivery} onChange={e => set('hasHandDelivery', e.target.checked)} className="w-5 h-5 accent-rose rounded" />
                <span className="text-white">🤝 Remise en main propre possible</span>
              </label>
              <p className="text-white/30 text-xs">
                La remise en main propre est particulièrement utile pour : Artisans fait main, Cadeaux personnalisés, Bougies & Parfums, Bijoux, Personnalisation textile.
              </p>
            </div>
          )}

          {/* Étape 4 : Catégories + Tarifs */}
          {step === 4 && (
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-white mb-2">Tarifs & Catégories</h2>
              <p className="text-white/40 text-sm mb-5">Facultatif mais recommandé : indiquer vos tarifs aide les clients à vous trouver.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">À partir de (€)</label>
                  <input type="number" min="0" value={form.priceMin} onChange={e => set('priceMin', e.target.value)}
                    className="input-dark" placeholder="30" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Jusqu&apos;à (€)</label>
                  <input type="number" min="0" value={form.priceMax} onChange={e => set('priceMax', e.target.value)}
                    className="input-dark" placeholder="200" />
                </div>
              </div>

              <h3 className="font-cormorant text-xl font-semibold text-white mb-2">Vos catégories</h3>
              <p className="text-white/40 text-xs mb-4">Sélectionnez toutes les catégories correspondant à votre activité.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                      form.categories.includes(cat.slug)
                        ? 'border-rose bg-rose/10 text-white'
                        : 'border-dark-border text-white/60 hover:border-rose/30 hover:text-white'
                    )}
                  >
                    <span>{cat.emoji}</span>
                    <span className="flex-1">{cat.name}</span>
                    {form.categories.includes(cat.slug) && <Check size={14} className="text-rose shrink-0" />}
                  </button>
                ))}
              </div>
              {form.categories.length === 0 && (
                <p className="text-white/30 text-xs mt-2">Sélectionnez au moins une catégorie</p>
              )}
            </div>
          )}

          {/* Étape 5 : Spécialités */}
          {step === 5 && (
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-white mb-2">Vos spécialités</h2>
              <p className="text-white/40 text-sm mb-6">
                Cochez ce que vous proposez exactement — cela aide les clients à vous trouver plus facilement.
              </p>

              {form.categories.map(catSlug => {
                const specs = SPECIALTIES[catSlug] ?? []
                if (specs.length === 0) return null
                const cat = CATEGORIES.find(c => c.slug === catSlug)
                return (
                  <div key={catSlug} className="mb-6">
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span>{cat?.emoji}</span> {cat?.name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {specs.map(sp => (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => toggleSpecialty(sp)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm text-left transition-all',
                            form.specialties.includes(sp)
                              ? 'border-rose bg-rose/10 text-white'
                              : 'border-dark-border text-white/50 hover:border-rose/30 hover:text-white'
                          )}
                        >
                          <span className="flex-1">{sp}</span>
                          {form.specialties.includes(sp) && <Check size={13} className="text-rose shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              {form.specialties.length > 0 && (
                <p className="text-white/30 text-xs mt-2">
                  {form.specialties.length} spécialité{form.specialties.length > 1 ? 's' : ''} sélectionnée{form.specialties.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Étape Abonnement */}
          {isAbonnementStep && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-cormorant text-3xl font-bold text-white mb-2">Dernière étape 🎉</h2>
                <p className="text-white/50 text-sm">Votre profil est créé ! Activez votre abonnement pour être visible.</p>
              </div>

              {/* Alerte visibilité */}
              <div className="flex items-start gap-3 bg-dark border border-white/10 rounded-xl p-4">
                <EyeOff size={18} className="text-white/40 shrink-0 mt-0.5" />
                <p className="text-white/50 text-sm">Sans abonnement, votre profil est <strong className="text-white">invisible</strong> pour les clientes. Activez-le maintenant pour apparaître dans les recherches.</p>
              </div>

              {/* Offre */}
              <div className="border border-gold/30 bg-gold/5 rounded-2xl p-6 text-center">
                <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Zap size={12} /> Offre lancement
                </div>
                {foundingCount !== null && foundingCount < 100 ? (
                  <>
                    <p className="font-cormorant text-4xl font-bold text-white mb-1">
                      6 mois <span className="text-gradient-rose-gold">gratuits</span>
                    </p>
                    <p className="text-white/50 text-sm mb-2">Pour les 100 premières prestataires — encore <strong className="text-gold">{100 - foundingCount} places</strong> disponibles</p>
                    <p className="text-white/40 text-xs mb-5">Puis seulement <strong className="text-white">4,99€/mois</strong> — sans engagement, résiliable à tout moment</p>
                  </>
                ) : (
                  <>
                    <p className="font-cormorant text-4xl font-bold text-white mb-1">
                      <span className="text-gradient-rose-gold">4,99€</span>/mois
                    </p>
                    <p className="text-white/50 text-sm mb-5">Sans engagement — résiliable à tout moment</p>
                  </>
                )}
                <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
                  {['Profil visible dans toutes les recherches', 'Photos & vidéos illimitées', 'Avis clients vérifiés', 'Tableau de bord complet'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={14} className="text-gold shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={subscribe} disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 text-base py-3">
                  {loading ? 'Redirection…' : foundingCount !== null && foundingCount < 100 ? '🎉 Profiter des 6 mois gratuits' : 'Activer mon abonnement'}
                </button>
                <p className="text-white/20 text-xs mt-3">Paiement sécurisé via Stripe · CB, Apple Pay, Google Pay</p>
              </div>

              <div className="text-center">
                <button onClick={() => router.push('/dashboard')} className="text-white/30 text-xs hover:text-white/50 underline">
                  Passer pour l'instant (profil invisible)
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-rose text-sm mt-4">{error}</p>}

          {/* Navigation */}
          {!isAbonnementStep && (
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft size={16} /> Précédent
                </button>
              )}
              <button onClick={next} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-1">
                {loading ? 'Création en cours…' : isLastBeforeAbonnement ? 'Continuer' : 'Suivant'}
                {!loading && <ChevronRight size={16} />}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-4">
          Déjà inscrit ?{' '}
          <Link href="/connexion" className="text-rose hover:underline">Se connecter</Link>
        </p>
        <p className="text-center text-white/20 text-xs mt-3 max-w-md mx-auto leading-relaxed">
          L&apos;abonnement MonPrestataire donne accès à une visibilité sur la plateforme et ne constitue pas une garantie de ventes ou de mise en relation.
        </p>
      </div>
    </div>
  )
}
