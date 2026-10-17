import { USERNAME_HINT, usernameSchema } from '@askesis/contracts'
import clsx from 'clsx'
import { AtSign, Check, LoaderCircle, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { authClient } from '../../lib/auth-client.ts'

export type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken' | 'current'

/**
 * Username input with live validation and an availability check against the
 * server (debounced). `current` is the user's existing handle, which counts as fine.
 */
export function UsernameField({
  value,
  onChange,
  onStatus,
  current,
  variant = 'auth',
  autoFocus,
}: {
  value: string
  onChange: (value: string) => void
  onStatus: (status: UsernameStatus) => void
  current?: string | null
  variant?: 'auth' | 'settings'
  autoFocus?: boolean
}) {
  const id = useId()
  const [status, setStatus] = useState<UsernameStatus>('idle')
  const [message, setMessage] = useState<string>(USERNAME_HINT)

  useEffect(() => {
    const report = (s: UsernameStatus, m: string) => {
      setStatus(s)
      setMessage(m)
      onStatus(s)
    }
    const trimmed = value.trim()
    if (!trimmed) return report('idle', USERNAME_HINT)
    const parsed = usernameSchema.safeParse(trimmed)
    if (!parsed.success) return report('invalid', parsed.error.issues[0]!.message)
    if (current && trimmed.toLowerCase() === current.toLowerCase()) return report('current', 'This is your username')

    // Ask the server once typing pauses; a newer value cancels the pending check.
    report('checking', 'Checking…')
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await authClient.isUsernameAvailable({ username: trimmed })
      if (cancelled) return
      if (error) report('invalid', error.message ?? 'Couldn’t check that username')
      else
        report(data?.available ? 'available' : 'taken', data?.available ? `@${trimmed} is available` : 'That username is taken')
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // onStatus is a setter from the parent; the value is what drives checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, current])

  const icon =
    status === 'checking' ? (
      <LoaderCircle size={15} className="auth-spin" />
    ) : status === 'available' || status === 'current' ? (
      <Check size={15} />
    ) : status === 'taken' || status === 'invalid' ? (
      <X size={15} />
    ) : null

  return (
    <div className={clsx('username-field', `username-field--${variant}`, `is-${status}`)}>
      <label htmlFor={id} className="username-field__label">
        Username
      </label>
      <div className="username-field__control">
        <AtSign size={16} className="username-field__at" aria-hidden />
        <input
          id={id}
          name="username"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
          required
          minLength={3}
          maxLength={24}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="ada_lovelace"
          aria-describedby={`${id}-hint`}
          aria-invalid={status === 'invalid' || status === 'taken' || undefined}
          autoFocus={autoFocus}
        />
        <span className="username-field__status" aria-hidden>
          {icon}
        </span>
      </div>
      <p id={`${id}-hint`} className="username-field__hint" aria-live="polite">
        {message}
      </p>
    </div>
  )
}

/** Whether the field holds a username that can be saved. */
export const usernameReady = (status: UsernameStatus) => status === 'available' || status === 'current'
