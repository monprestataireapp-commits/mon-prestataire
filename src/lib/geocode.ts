export async function geocodeCity(city: string, region?: string): Promise<{ lat: number; lng: number } | null> {
  const query = [city, region, 'France'].filter(Boolean).join(', ')
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=fr`,
      { headers: { 'User-Agent': 'MonPrestataire/1.0 contact@mon-prestataire.fr' } }
    )
    const data = await res.json()
    if (!data?.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
