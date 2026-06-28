'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { CATEGORIES } from '@/lib/categories'
import { SPECIALTIES } from '@/lib/specialties'
import { DEPARTMENTS_FRANCE, REGIONS_FRANCE } from '@/lib/utils'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Compte', 'Profil', 'Localisation', 'Livraison', 'Catégories', 'Spécialités']

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '',
    businessName: '', description: '', phone: '', instagramUrl: '', tiktokUrl: '', website: '',
    yearsExperience: '',
    city: '', region: '', department: '', departmentCode: '',
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

  async function submit() {
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
      router.push('/bienvenue')
    } finally {
      setLoading(false)
    }
  }

  // Étapes effectives (on saute Spécialités si aucune dispo)
  const totalSteps = hasSpecialties ? STEPS.length : STEPS.length - 1

  function next() {
    if (step === 0) {
      if (!form.email || !form.password) { setError('Champs obligatoires'); return }
      if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
      if (form.password.length < 8) { setError('Mot de passe trop court (8 caractères minimum)'); return }
    }
    if (step === 1 && !form.businessName) { setError('Nom de votre activité obligatoire'); return }
    if (step === 4 && form.categories.length === 0) { setError('Sélectionnez au moins une catégorie'); return }
    setError('')
    // Si étape catégories et pas de spécialités → soumettre directement
    if (step === 4 && !hasSpecialties) { submit(); return }
    if (step < totalSteps - 1) setStep(s => s + 1)
    else submit()
  }

  const stepLabels = hasSpecialties ? STEPS : STEPS.slice(0, -1)

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-gradient-rose-gold mb-2">
            Devenir prestataire
          </h1>
          <p className="text-white/50 text-sm">Créez votre profil et rejoignez la communauté MonPrestataire</p>
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
                <label className="text-xs text-white/50 mb-1 block">Ville *</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className="input-dark" placeholder="Paris, Lyon, Marseille…" />
              </div>
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
              <div>
                <label className="text-xs text-white/50 mb-1 block">Région</label>
                <select value={form.region} onChange={e => set('region', e.target.value)} className="input-dark bg-dark-card">
                  <option value="">Sélectionner une région</option>
                  {REGIONS_FRANCE.map(r => <option key={r} value={r}>{r}</option>)}
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

          {error && <p className="text-rose text-sm mt-4">{error}</p>}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1">
                <ChevronLeft size={16} /> Précédent
              </button>
            )}
            <button onClick={next} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-1">
              {loading ? 'Création…' : step === totalSteps - 1 ? 'Créer mon profil' : 'Suivant'}
              {!loading && step < totalSteps - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-4">
          Déjà inscrit ?{' '}
          <Link href="/connexion" className="text-rose hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
