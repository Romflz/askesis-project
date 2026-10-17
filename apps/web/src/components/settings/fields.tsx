import clsx from 'clsx'
import { useId, type ReactNode } from 'react'

// Small form primitives for the settings page. Inputs are controlled with
// string values so a field can be empty mid-edit; parsing happens on save.

/**
 * A labelled form row. `children` renders the control and receives the id and
 * ARIA props to spread on it, so any input type can be wrapped. An error
 * replaces the help text.
 */
export function Field({
  label,
  help,
  error,
  suffix,
  children,
  className,
}: {
  label: string
  help?: ReactNode
  error?: string
  suffix?: string
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
  className?: string
}) {
  const id = useId()
  const helpId = `${id}-help`
  return (
    <div className={clsx('field', error && 'has-error', className)}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className={clsx('field__control', suffix && 'has-suffix')}>
        {children({ id, 'aria-describedby': help || error ? helpId : undefined, 'aria-invalid': !!error || undefined })}
        {suffix && <span className="field__suffix">{suffix}</span>}
      </div>
      {(error || help) && (
        <p id={helpId} className={clsx('field__help', error && 'field__help--error')}>
          {error ?? help}
        </p>
      )}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (value: string) => void
}) {
  return <input className="input" value={value} onChange={(e) => onChange(e.target.value)} {...props} />
}

export function Select({
  value,
  onChange,
  options,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select className="input select" value={value} onChange={(e) => onChange(e.target.value)} {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** An on/off toggle button (role="switch") with a label and an optional description. */
export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: ReactNode
}) {
  const id = useId()
  return (
    <div className="switch-row">
      <div>
        <label htmlFor={id} className="switch-row__label">
          {label}
        </label>
        {description && <p className="switch-row__description">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={clsx('switch', checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  )
}

/** A settings section; `id` is its anchor (e.g. /settings#presets) and names its heading. */
export function SettingsCard({
  id,
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  id: string
  eyebrow: string
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="panel settings-card" id={id} aria-labelledby={`${id}-title`}>
      <header className="settings-card__header">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="settings-card__title" id={`${id}-title`}>
          {title}
        </h2>
        {description && <p className="settings-card__description">{description}</p>}
      </header>
      {children}
      {footer && <footer className="settings-card__footer">{footer}</footer>}
    </section>
  )
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SaveStatus({ state, error }: { state: SaveState; error?: string }) {
  if (state === 'idle') return null
  return (
    <span className={clsx('save-status', `save-status--${state}`)} role="status">
      {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : (error ?? 'Couldn’t save')}
    </span>
  )
}
