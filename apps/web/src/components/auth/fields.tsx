import clsx from 'clsx'
import { CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

/** A labelled input with a leading icon; `aside` sits at the end of the label row. */
export function Field({
  label,
  icon,
  aside,
  ...input
}: { label: string; icon: ReactNode; aside?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className="auth-field">
      <div className="auth-field__row">
        <label htmlFor={id} className="auth-field__label">
          {label}
        </label>
        {aside}
      </div>
      <div className="auth-input">
        <span className="auth-input__icon" aria-hidden>
          {icon}
        </span>
        <input id={id} className="auth-input__control" {...input} />
      </div>
    </div>
  )
}

const STRENGTH = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'] as const

/** 0 below the 8-character minimum, then 1–4 for length and variety. */
export function passwordStrength(password: string): number {
  if (password.length < 8) return 0
  let score = 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(4, score)
}

/**
 * A password input with a show/hide toggle and an optional strength meter. The
 * input stays uncontrolled (forms read it from FormData); the value is only
 * mirrored here for the meter.
 */
export function PasswordField({
  label = 'Password',
  icon,
  showStrength = false,
  aside,
  ...input
}: {
  label?: string
  icon: ReactNode
  showStrength?: boolean
  aside?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  const hintId = useId()
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState('')
  const strength = passwordStrength(value)

  return (
    <div className="auth-field">
      <div className="auth-field__row">
        <label htmlFor={id} className="auth-field__label">
          {label}
        </label>
        {aside}
      </div>
      <div className="auth-input">
        <span className="auth-input__icon" aria-hidden>
          {icon}
        </span>
        <input
          id={id}
          className="auth-input__control"
          type={visible ? 'text' : 'password'}
          aria-describedby={showStrength ? hintId : undefined}
          onChange={(e) => setValue(e.target.value)}
          {...input}
        />
        <button
          type="button"
          className="auth-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {showStrength && (
        <div className="auth-strength" id={hintId}>
          <div className={clsx('auth-strength__bars', value && `is-${strength}`)} aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={clsx(value && n <= Math.max(1, strength) && 'is-on')} />
            ))}
          </div>
          <span className="auth-strength__label" aria-live="polite">
            {value ? STRENGTH[strength] : 'At least 8 characters'}
          </span>
        </div>
      )}
    </div>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="auth-error" role="alert">
      <CircleAlert size={16} />
      {message}
    </p>
  )
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button type="submit" className="btn btn--primary btn--block auth-submit" disabled={pending} aria-busy={pending}>
      {pending && <LoaderCircle size={16} className="auth-spin" />}
      {children}
    </button>
  )
}

/** Friendlier copy for Better Auth's common error codes. */
export function authErrorMessage(error: { code?: string; message?: string } | null | undefined): string {
  switch (error?.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'That email and password don’t match.'
    case 'INVALID_USERNAME_OR_PASSWORD':
      return 'That username and password don’t match.'
    case 'USERNAME_IS_ALREADY_TAKEN':
    case 'USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER':
      return 'That username is taken. Try another.'
    case 'INVALID_USERNAME':
    case 'USERNAME_TOO_SHORT':
    case 'USERNAME_TOO_LONG':
      return 'Usernames are 3–24 letters, numbers, underscores or dots.'
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'An account with this email already exists. Try signing in.'
    case 'PASSWORD_TOO_SHORT':
      return 'Use at least 8 characters for your password.'
    case 'INVALID_EMAIL':
      return 'That doesn’t look like a valid email address.'
    default:
      return error?.message ?? 'Something went wrong. Please try again.'
  }
}
