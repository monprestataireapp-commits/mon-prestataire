'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import { getPhotoUrl } from '@/lib/photo'

// Fix icônes Leaflet avec Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createCategoryIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:linear-gradient(135deg,#e11d48,#f59e0b);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4);
      border:2px solid rgba(255,255,255,0.2);
    ">${emoji}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function FitBounds({ providers }: { providers: any[] }) {
  const map = useMap()
  useEffect(() => {
    if (providers.length === 0) return
    if (providers.length === 1) {
      map.setView([providers[0].latitude, providers[0].longitude], 10)
      return
    }
    const bounds = L.latLngBounds(providers.map(p => [p.latitude, p.longitude]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [providers, map])
  return null
}

interface Props {
  providers: any[]
}

export default function MapClient({ providers }: Props) {
  return (
    <MapContainer
      center={[46.5, 2.5]}
      zoom={6}
      style={{ height: '600px', width: '100%', borderRadius: '16px' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>'
      />
      <FitBounds providers={providers} />
      {providers.map(p => {
        const emoji = p.categories?.[0]?.category?.emoji || '✨'
        return (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={createCategoryIcon(emoji)}
          >
            <Popup className="map-popup">
              <div style={{ minWidth: '180px', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden',
                    background: '#1a1a2e', flexShrink: 0, border: '2px solid rgba(225,29,72,0.3)'
                  }}>
                    {p.profilePhoto && (
                      <img
                        src={getPhotoUrl(p.profilePhoto)}
                        alt={p.businessName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#fff', fontSize: '14px', margin: 0 }}>
                      {p.businessName}
                      {p.isVerified && ' ✅'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 }}>
                      {emoji} {p.categories?.[0]?.category?.name} · {p.city}
                    </p>
                  </div>
                </div>
                <a
                  href={`/prestataire/${p.slug}`}
                  style={{
                    display: 'block', textAlign: 'center', padding: '6px 12px',
                    background: 'linear-gradient(135deg,#e11d48,#f59e0b)',
                    color: '#fff', borderRadius: '8px', fontSize: '12px',
                    textDecoration: 'none', fontWeight: 500,
                  }}
                >
                  Voir le profil →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
