'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export function NotificationBadge() {
  const { data: session } = useSession()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!session?.user) return
    const role = ((session.user as any).role || '').toUpperCase()
    if (role !== 'PROVIDER' && role !== 'ADMIN') return

    function fetchCount() {
      fetch('/api/dashboard/notifications')
        .then(r => r.json())
        .then(d => setCount(d.count || 0))
        .catch(() => {})
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60_000) // rafraîchit toutes les minutes
    return () => clearInterval(interval)
  }, [session])

  if (!count) return null

  return (
    <Link href="/dashboard" className="relative inline-flex">
      <Bell size={20} className="text-white/60 hover:text-white transition-colors" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">
        {count > 9 ? '9+' : count}
      </span>
    </Link>
  )
}

