'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { DevisModal } from './DevisModal'

interface Props {
  providerId: string
  providerName: string
}

export function DevisButton({ providerId, providerName }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-rose hover:bg-rose-dark text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        <Send size={14} /> Demande de devis
      </button>
      {open && (
        <DevisModal
          providerId={providerId}
          providerName={providerName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

