'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Lock, Trash2, User, CheckCircle, Edit2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function ComptePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const role = (session?.user as any)?.role
  const [editName, setEditName] = useState(false)
  const [nameValue, setNameValue] = useState(session?.user?.name || '')
  const [nameLoading, setNameLoading] = useState(false)

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    if (!nameValue.trim() || nameValue.trim().length < 2) return
    setNameLoading(true)
    try {
      const res = await fetch('/api/account/update-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue }),
      })
      if (!res.ok) { toast('Erreur lors de la mise à jour', 'error'); return }
      await update({ name: nameValue })
      setEditName(false)
      toast('Nom mis à jour', 'success')
    } finally {
      setNameLoading(false)
    }
  }

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwDone, setPwDone] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast('Les mots de passe ne correspondent pas', 'error')
      return
    }
    if (pwForm.newPassword.length < 8) {
      toast('Le mot de passe doit faire au moins 8 caractères', 'error')
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error || 'Erreur', 'error'); return }
      setPwDone(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast('Mot de passe modifié avec succès', 'success')
    } finally {
      setPwLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Veuillez vous <Link href="/connexion" className="text-rose hover:underline">connecter</Link>.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-2xl mx-auto">
      <Link href={role === 'PROVIDER' ? '/dashboard' : '/'} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={15} /> Retour
      </Link>

      <h1 className="font-cormorant text-3xl font-bold text-white mb-8">
        Paramètres <span className="text-gradient-rose-gold">du compte</span>
      </h1>

      {/* Infos compte */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
            <User size={18} className="text-rose" />
          </div>
          <h2 className="font-cormorant text-xl font-semibold text-white">Informations</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-dark-border">
            <span className="text-white/40 text-sm">Nom</span>
            {editName ? (
              <form onSubmit={handleUpdateName} className="flex items-center gap-2">
                <input
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  className="bg-dark border border-dark-border rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-rose/40 w-32"
                  autoFocus
                />
                <button type="submit" disabled={nameLoading} className="text-rose text-xs hover:text-rose-dark">
                  {nameLoading ? '…' : 'OK'}
                </button>
                <button type="button" onClick={() => setEditName(false)} className="text-white/30 text-xs">
                  Annuler
                </button>
              </form>
            ) : (
              <button onClick={() => { setNameValue(session.user?.name || ''); setEditName(true) }}
                className="flex items-center gap-2 text-white text-sm hover:text-rose transition-colors group">
                {session.user.name || '—'}
                <Edit2 size={12} className="text-white/20 group-hover:text-rose" />
              </button>
            )}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-dark-border">
            <span className="text-white/40 text-sm">Email</span>
            <span className="text-white text-sm">{session.user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white/40 text-sm">Rôle</span>
            <span className="text-white/70 text-sm capitalize">{role?.toLowerCase() || 'Client'}</span>
          </div>
        </div>
      </div>

      {/* Changer mot de passe */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Lock size={18} className="text-gold" />
          </div>
          <h2 className="font-cormorant text-xl font-semibold text-white">Changer le mot de passe</h2>
        </div>

        {pwDone ? (
          <div className="flex items-center gap-2 text-green-400 text-sm py-3">
            <CheckCircle size={16} /> Mot de passe modifié avec succès
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Mot de passe actuel</label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="input-dark w-full"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                className="input-dark w-full"
                placeholder="8 caractères minimum"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                required
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="input-dark w-full"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={pwLoading} className="btn-primary disabled:opacity-50">
              {pwLoading ? 'Modification…' : 'Modifier le mot de passe'}
            </button>
          </form>
        )}
      </div>

      {/* Zone danger */}
      <div className="bg-dark-card border border-rose/20 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
            <Trash2 size={18} className="text-rose" />
          </div>
          <h2 className="font-cormorant text-xl font-semibold text-white">Zone de danger</h2>
        </div>
        <p className="text-white/40 text-sm mb-4">
          La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
        </p>
        <Link href="/compte/supprimer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose/30 text-rose hover:bg-rose/10 text-sm transition-colors">
          <Trash2 size={14} /> Supprimer mon compte
        </Link>
      </div>
    </div>
  )
}

