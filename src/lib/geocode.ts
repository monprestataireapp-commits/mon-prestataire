export async function geocodeCity(city: string, region?: string, country?: string): Promise<{ lat: number; lng: number } | null> {
  const query = [city, region, country || 'France'].filter(Boolean).join(', ')
  const countryCodes = 'fr,be,lu,ch,de,es,it,pt,nl,at,gb,ie,dk,se,no,fi,pl,cz,hr,gr,ro,bg,hu,sk,si'
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=${countryCodes}`,
      { headers: { 'User-Agent': 'MonPrestataire/1.0 contact@mon-prestataire.fr' } }
    )
    const data = await res.json()
    if (!data?.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
