import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 3600

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const provider = await prisma.provider.findUnique({
    where: { slug: params.slug },
    select: {
      businessName: true,
      description: true,
      city: true,
      region: true,
      profilePhoto: true,
      isVerified: true,
      subscriptionPlan: true,
      categories: { include: { category: { select: { name: true, emoji: true } } }, take: 3 },
    },
  })

  if (!provider) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#1A1118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#C8547A', fontSize: 48, fontWeight: 700 }}>MonPrestataire</p>
      </div>
    )
  }

  const cats = provider.categories.map(c => `${c.category.emoji} ${c.category.name}`).join('  ·  ')
  const description = (provider.description || '').slice(0, 120)

  return new ImageResponse(
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1A1118 0%, #231820 50%, #1A1118 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px 80px',
      fontFamily: 'sans-serif',
      position: 'relative',
    }}>
      {/* Accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #C8547A, #C9A96E)' }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
        <p style={{ color: '#C8547A', fontSize: 22, fontWeight: 700, margin: 0 }}>MonPrestataire</p>
        {provider.isVerified && (
          <span style={{ marginLeft: 12, background: 'rgba(200,84,122,0.15)', border: '1px solid rgba(200,84,122,0.3)', borderRadius: 20, padding: '4px 12px', color: '#C8547A', fontSize: 14 }}>
            ✅ Vérifié
          </span>
        )}
        {provider.subscriptionPlan === 'premium' && (
          <span style={{ marginLeft: 8, background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', borderRadius: 20, padding: '4px 12px', color: '#C9A96E', fontSize: 14 }}>
            ★ Premium
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flex: 1 }}>
        {/* Photo */}
        {provider.profilePhoto && (
          <div style={{ width: 160, height: 160, borderRadius: 24, overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(200,84,122,0.3)' }}>
            <img src={provider.profilePhoto} width={160} height={160} style={{ objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1 style={{ fontSize: 52, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.1 }}>
            {provider.businessName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, margin: 0 }}>
            📍 {provider.city}, {provider.region}
          </p>
          {description && (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 18, margin: 0, lineHeight: 1.5 }}>
              {description}{description.length < (provider.description || '').length ? '…' : ''}
            </p>
          )}
          {cats && (
            <p style={{ color: '#C9A96E', fontSize: 16, margin: 0 }}>{cats}</p>
          )}
        </div>
      </div>
    </div>
  )
}
