import { useRouter } from '@tanstack/react-router'
import { AtSign } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '../../lib/auth-client.ts'
import { UsernameField, type UsernameStatus, usernameReady } from './UsernameField.tsx'

/** A one-time dialog for signed-in users who don't have a username yet. */
export function UsernamePrompt() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<UsernameStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!usernameReady(status)) return
    setPending(true)
    setError(null)
    const username = value.trim()
    const { error } = await authClient.updateUser({ username, displayUsername: username })
    setPending(false)
    if (error) return setError(error.message ?? 'Couldn’t save that username.')
    // Reloading the session closes the prompt: the user has a username now.
    await router.invalidate()
  }

  return (
    <div className="username-prompt" role="dialog" aria-modal="true" aria-labelledby="username-prompt-title">
      <form className="username-prompt__card panel" onSubmit={save}>
        <span className="username-prompt__icon" aria-hidden>
          <AtSign size={20} />
        </span>
        <h2 id="username-prompt-title" className="username-prompt__title">
          Pick your username
        </h2>
        <p className="username-prompt__text">It’s your public handle on Askesis. You can change it later in Settings.</p>
        <UsernameField value={value} onChange={setValue} onStatus={setStatus} variant="settings" autoFocus />
        {error && <p className="username-prompt__error">{error}</p>}
        <button type="submit" className="btn btn--primary btn--block" disabled={!usernameReady(status) || pending}>
          {pending ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  )
}
