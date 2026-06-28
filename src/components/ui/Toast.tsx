'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: number; message: string; type: ToastType }

const ToastCtx = createContext<{ toast: (msg: string, type?: ToastType) => void }>({
  toast: () => {},
})

export function useToast() { return useContext(ToastCtx) }

let _toast: (msg: string, type?: ToastType) => void = () => {}
export const toast = (msg: string, type: ToastType = 'success') => _toast(msg, type)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let next = 0

  const add = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++next
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  useEffect(() => { _toast = add }, [add])

  const ICONS = {
    success: <CheckCircle size={16} className="text-green-400 shrink-0" />,
    error: <XCircle size={16} className="text-rose shrink-0" />,
    info: <AlertCircle size={16} className="text-blue-400 shrink-0" />,
  }

  return (
    <ToastCtx.Provider value={{ toast: add }}>
      {children}
      <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={cn(
              'flex items-center gap-3 bg-dark-card border rounded-xl px-4 py-3 shadow-xl pointer-events-auto animate-in slide-in-from-right-4 duration-300',
              t.type === 'error' ? 'border-rose/30' : t.type === 'success' ? 'border-green-500/30' : 'border-blue-400/30'
            )}>
            {ICONS[t.type]}
            <p className="text-white text-sm flex-1">{t.message}</p>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
              className="text-white/30 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

