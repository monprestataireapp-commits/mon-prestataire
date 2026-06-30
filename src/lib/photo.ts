export function getPhotoUrl(url: string | null | undefined, fallback = '/placeholder-provider.svg'): string {
  if (!url) return fallback
  if (url.includes('.private.blob.vercel-storage.com')) {
    return `/api/photo?url=${encodeURIComponent(url)}`
  }
  return url
}
