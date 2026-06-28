'use client'

import { useState } from 'react'
import { Share2, Check, Link as LinkIcon } from 'lucide-react'

interface Props {
  businessName: string
}

export function ShareButton({ businessName }: Props) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: businessName, url })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={share}
      className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border hover:border-rose/30 flex items-center justify-center text-white/50 hover:text-white transition-colors">
      {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
    </button>
  )
}

