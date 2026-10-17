import { Link } from '@tanstack/react-router'
import { LogIn, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface LoginPromptCopy {
  title: string
  text: string
}

/**
 * Asks a visitor to log in when they try something that needs an account
 * (opening the chest, claiming a quest, their own analytics). Closes on Esc,
 * a click outside or the close button; focus moves to the primary button.
 */
export function LoginPrompt({
  copy,
  redirect,
  onClose,
}: {
  /** Null keeps it closed. */
  copy: LoginPromptCopy | null
  /** Where logging in or signing up returns to. */
  redirect: string
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion() ?? false
  const primary = useRef<HTMLAnchorElement>(null)
  // The portal needs document.body, which only exists after hydration.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!copy) return
    primary.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [copy, onClose])

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {copy && (
        <motion.div
          className="login-prompt"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          <motion.div
            className="login-prompt__card"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <button type="button" className="icon-btn login-prompt__close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
            <span className="login-prompt__icon" aria-hidden>
              <LogIn size={18} />
            </span>
            <h2 id="login-prompt-title" className="login-prompt__title">
              {copy.title}
            </h2>
            <p className="login-prompt__text">{copy.text}</p>
            <div className="login-prompt__actions">
              <Link ref={primary} to="/login" search={{ redirect }} className="btn btn--primary">
                Log in
              </Link>
              <Link to="/register" search={{ redirect }} className="btn btn--ghost">
                Create a free account
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
