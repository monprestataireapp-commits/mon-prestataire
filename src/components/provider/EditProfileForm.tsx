'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { DEPARTMENTS_FRANCE, REGIONS_FRANCE } from '@/lib/utils'
import { Check, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfilePhotoUpload } from '@/components/dashboard/ProfilePhotoUpload'
import { toast } from '@/components/ui/Toast'

interface Props {
  provider: any
}

export function EditProfileForm({ provider }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    businessName: provider.businessName || '',
    description: provider.description || '',
    phone: provider.phone || '',
    phonePublic: provider.phonePublic || false,
    instagramUrl: provider.instagramUrl || '',
    tiktokUrl: provider.tiktokUrl || '',
    website: provider.website || '',
    city: provider.city || '',
    region: provider.region || '',
    department: provider.department || '',
    departmentCode: provider.departmentCode || '',
    yearsExperience: provider.yearsExperience?.toString() || '',
    isAvailableToday: provider.isAvailableToday || false,
    responseTime: provider.responseTime || '',
    availabilityNotes: provider.availabilityNotes || '',
    hasDelivery: provider.hasDelivery || false,
    deliveryZone: provider.deliveryZone || '',
    deliveryFee: provider.deliveryFee || '',
    hasHandDelivery: provider.hasHandDelivery || false,
    priceMin: provider.priceMin?.toString() || '',
    priceMax: provider.priceMax?.toString() || '',
    categories: provider.categories?.map((c: any) => c.category.slug) || [],
  })

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function toggleCategory(slug: string) {
    set('categories', form.categories.includes(slug)
      ? form.categories.filter((s: string) => s !== slug)
      : [...form.categories, slug]
    )
  }

  async function save() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/providers/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); toast(d.error || 'Erreur lors de la sauvegarde', 'error'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast('Profil mis à jour avec succès !', 'success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cormorant text-3xl font-bold text-white">Modifier mon profil</h1>
        <button onClick={save} disabled={loading} className={cn('flex items-center gap-2 text-sm', saved ? 'btn-gold' : 'btn-primary')}>
          {saved ? <><Check size={15} /> Sauvegardé</> : loading ? 'Sauvegarde…' : <><Save size={15} /> Sauvegarder</>}
        </button>
      </div>

      <div className="space-y-6">
        {/* Photos */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">Photos</h2>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Photo de couverture</label>
            <ProfilePhotoUpload currentUrl={provider.coverPhoto} type="cover" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-2 block">Photo de profil</label>
            <ProfilePhotoUpload currentUrl={provider.profilePhoto} type="profile" size={96} />
          </div>
        </div>

        {/* Informations de base */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">Informations générales</h2>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Nom de l&apos;activité *</label>
            <input value={form.businessName} onChange={e => set('businessName', e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} className="input-dark resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Téléphone</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-dark" />
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
            <div>
              <label className="text-xs text-white/50 mb-1 block">Années d&apos;expérience</label>
              <input type="number" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} className="input-dark" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Instagram</label>
              <input value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} className="input-dark" placeholder="https://instagram.com/…" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">TikTok</label>
              <input value={form.tiktokUrl} onChange={e => set('tiktokUrl', e.target.value)} className="input-dark" placeholder="https://tiktok.com/@…" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/50 mb-1 block">Site web</label>
              <input value={form.website} onChange={e => set('website', e.target.value)} className="input-dark" placeholder="https://monsite.fr" />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">Localisation</h2>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Ville</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Département</label>
            <select value={form.departmentCode} onChange={e => {
              const dept = DEPARTMENTS_FRANCE.find(d => d.code === e.target.value)
              set('departmentCode', e.target.value)
              set('department', dept?.name || '')
              set('region', dept?.region || '')
            }} className="input-dark bg-dark-card">
              <option value="">Sélectionner</option>
              {DEPARTMENTS_FRANCE.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
            </select>
          </div>
        </div>

        {/* Tarifs */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">Tarifs</h2>
          <p className="text-white/40 text-xs">Indiquer vos tarifs aide les clients à mieux cibler leurs recherches.</p>
          <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Disponibilités */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">Disponibilités</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isAvailableToday} onChange={e => set('isAvailableToday', e.target.checked)} className="w-5 h-5 accent-rose" />
            <span className="text-white">🟢 Disponible aujourd&apos;hui</span>
          </label>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Temps de réponse habituel</label>
            <select value={form.responseTime} onChange={e => set('responseTime', e.target.value)} className="input-dark bg-dark-card">
              <option value="">Sélectionner</option>
              <option value="< 15 min">Moins de 15 minutes</option>
              <option value="< 1h">Moins d&apos;1 heure</option>
              <option value="< 24h">Moins de 24 heures</option>
              <option value="quelques jours">Quelques jours</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Notes de disponibilité</label>
            <textarea value={form.availabilityNotes} onChange={e => set('availabilityNotes', e.target.value)} rows={3} className="input-dark resize-none" placeholder="Ex: Disponible les week-ends et soirées. Fermeture en août." />
          </div>
        </div>

        {/* Livraison */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">Livraison</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.hasDelivery} onChange={e => set('hasDelivery', e.target.checked)} className="w-5 h-5 accent-rose" />
            <span className="text-white">🚚 Je propose la livraison</span>
          </label>
          {form.hasDelivery && (
            <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Zone de livraison</label>
                <select value={form.deliveryZone} onChange={e => set('deliveryZone', e.target.value)} className="input-dark bg-dark-card">
                  <option value="">Sélectionner</option>
                  <option value="france">France entière</option>
                  <option value="region">Ma région</option>
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
                  <option value="selon_commande">Selon commande</option>
                </select>
              </div>
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.hasHandDelivery} onChange={e => set('hasHandDelivery', e.target.checked)} className="w-5 h-5 accent-rose" />
            <span className="text-white">🤝 Remise en main propre possible</span>
          </label>
        </div>

        {/* Catégories */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-cormorant text-xl font-semibold text-white mb-4">Mes catégories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)}
                className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all',
                  form.categories.includes(cat.slug) ? 'border-rose bg-rose/10 text-white' : 'border-dark-border text-white/60 hover:border-rose/30'
                )}>
                <span>{cat.emoji}</span>
                <span className="flex-1">{cat.name}</span>
                {form.categories.includes(cat.slug) && <Check size={13} className="text-rose shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-rose text-sm">{error}</p>}

        <button onClick={save} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} />
          {loading ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  )
}

