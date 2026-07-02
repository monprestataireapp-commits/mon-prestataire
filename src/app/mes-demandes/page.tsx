import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPhotoUrl } from '@/lib/photo'
import Image from 'next/image'
import { MapPin, Calendar, Euro, MessageSquare, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MesDemandesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/connexion')

  const userId = (session.user as any).id

  const requests = await prisma.clientRequest.findMany({
    where: { userId },
    include: {
      responses: {
        include: {
          provider: {
            select: {
              businessName: true,
              slug: true,
              profilePhoto: true,
              isVerified: true,
              subscriptionPlan: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white mb-1">
            Mes <span className="text-gradient-rose-gold">demandes</span>
          </h1>
          <p className="text-white/40 text-sm">{requests.length} demande{requests.length > 1 ? 's' : ''} publiée{requests.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/demandes" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Nouvelle demande
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <h2 className="font-cormorant text-2xl text-white mb-2">Aucune demande publiée</h2>
          <p className="text-white/40 text-sm mb-6">Publiez votre besoin et recevez des offres des prestataires.</p>
          <Link href="/demandes" className="btn-primary">Publier une demande</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <div key={req.id} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              {/* Entête de la demande */}
              <div className="p-5 border-b border-dark-border">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-cormorant text-xl font-semibold text-white mb-1">{req.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-white/40">
                      {req.city && <span className="flex items-center gap-1"><MapPin size={11} /> {req.city}</span>}
                      {req.budget && <span className="flex items-center gap-1"><Euro size={11} /> {req.budget}€ max</span>}
                      {req.eventDate && <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(req.eventDate)}</span>}
                      <span>Publié le {formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <MessageSquare size={13} className="text-rose" />
                    <span className="text-white font-medium">{req.responses.length}</span>
                    <span className="text-white/40">réponse{req.responses.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">{req.description}</p>
              </div>

              {/* Réponses des prestataires */}
              {req.responses.length === 0 ? (
                <div className="p-5 text-center text-white/30 text-sm">
                  En attente de réponses des prestataires…
                </div>
              ) : (
                <div className="divide-y divide-dark-border">
                  {req.responses.map(resp => (
                    <div key={resp.id} className="p-5">
                      <div className="flex items-start gap-3">
                        {/* Photo prestataire */}
                        <Link href={`/prestataire/${resp.provider.slug}`} className="shrink-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark border border-dark-border">
                            {resp.provider.profilePhoto ? (
                              <Image src={getPhotoUrl(resp.provider.profilePhoto)} alt={resp.provider.businessName} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-rose to-gold flex items-center justify-center text-white text-sm font-bold">
                                {resp.provider.businessName[0]}
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Link href={`/prestataire/${resp.provider.slug}`}
                              className="text-white font-medium text-sm hover:text-rose transition-colors">
                              {resp.provider.businessName}
                            </Link>
                            {resp.provider.isVerified && (
                              <span className="badge-verified text-xs">✅ Vérifié</span>
                            )}
                            {resp.provider.subscriptionPlan === 'premium' && (
                              <span className="badge-premium text-xs">★ Premium</span>
                            )}
                            <span className="text-white/30 text-xs">{formatDate(resp.createdAt)}</span>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed">{resp.message}</p>
                          {resp.price && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-lg px-3 py-1">
                              <Euro size={12} className="text-gold" />
                              <span className="text-gold text-sm font-medium">{resp.price}€ proposé</span>
                            </div>
                          )}
                        </div>

                        <Link href={`/prestataire/${resp.provider.slug}`}
                          className="btn-secondary text-xs py-1 px-3 shrink-0">
                          Voir profil
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

