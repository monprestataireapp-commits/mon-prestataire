'use client'

import { useEffect, useRef } from 'react'

export function ViewTracker({ slug, isOwner }: { slug: string; isOwner?: boolean }) {
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current || isOwner) return
    tracked.current = true
    fetch(`/api/providers/${slug}/view`, { method: 'POST' }).catch(() => {})
  }, [slug, isOwner])
  return null
}
