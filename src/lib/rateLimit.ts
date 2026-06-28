// Sliding window rate limiter en mémoire (single instance — OK pour Vercel serverless par worker)
const store = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = (store.get(key) || []).filter(t => now - t < windowMs)
  if (timestamps.length >= limit) return false
  timestamps.push(now)
  store.set(key, timestamps)
  // Nettoyage périodique pour éviter les fuites mémoire
  if (store.size > 10_000) {
    store.forEach((v, k) => {
      if (v.every(t => now - t >= windowMs)) store.delete(k)
    })
  }
  return true
}

export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
