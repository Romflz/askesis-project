import clsx from 'clsx'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

// Small status toasts for the decks manager ("Deck created", "Couldn't save").

interface Toast {
  id: number
  tone: 'ok' | 'error'
  text: string
}

const ToastContext = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})

/** Returns `toast(text, tone?)`; errors stay up longer than confirmations. */
export function useToast() {
  return useContext(ToastContext)
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const push = useCallback(
    (text: string, tone: Toast['tone'] = 'ok') => {
      const id = nextId++
      // At most four on screen; the oldest makes room.
      setToasts((t) => [...t.slice(-3), { id, tone, text }])
      setTimeout(() => dismiss(id), tone === 'error' ? 6_000 : 3_500)
    },
    [dismiss],
  )

  return (
    <ToastContext value={push}>
      {children}
      <div className="deckmgr-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={clsx('deckmgr-toast', `deckmgr-toast--${t.tone}`)}>
            {t.tone === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{t.text}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
