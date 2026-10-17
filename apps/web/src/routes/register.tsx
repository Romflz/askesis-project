import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { AuthShell } from '../components/auth/AuthShell.tsx'
import { authErrorMessage, Field, FormError, PasswordField, SubmitButton } from '../components/auth/fields.tsx'
import { UsernameField, type UsernameStatus, usernameReady } from '../components/auth/UsernameField.tsx'
import { authClient } from '../lib/auth-client.ts'
import { clearUserData } from '../lib/queries.ts'
import { redirectSearch } from '../lib/safe-redirect.ts'
import { seo } from '../lib/seo.ts'

export const Route = createFileRoute('/register')({
  staticData: { ownChrome: true },
  validateSearch: redirectSearch,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: search.redirect ?? '/dashboard' })
  },
  head: () =>
    seo({
      title: 'Create a free account · Askesis',
      description:
        'Create a free Askesis account: spaced repetition with SM-2 or FSRS scheduling, streaks, trophies and daily reminders.',
      path: '/register',
    }),
  component: Register,
})

function Register() {
  const { redirect: target } = Route.useSearch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const next = target ?? '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!usernameReady(usernameStatus)) return setError('Pick an available username first.')
    const form = new FormData(e.currentTarget)
    setPending(true)
    setError(null)
    const handle = username.trim()
    const { error } = await authClient.signUp.email({
      name: String(form.get('name')).trim(),
      email: String(form.get('email')),
      password: String(form.get('password')),
      // The server stores username lowercased; displayUsername keeps the casing as typed.
      username: handle,
      displayUsername: handle,
    })
    if (error) {
      setPending(false)
      return setError(authErrorMessage(error))
    }
    // Nothing cached for a previous account may show; then re-run beforeLoad (session) everywhere and continue.
    clearUserData(queryClient)
    await router.invalidate()
    await router.navigate({ href: next })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start a streak today. Your first decks are ready when you are."
      footer={
        <>
          Already have an account?{' '}
          <Route.Link to="/login" search={{ redirect: target }}>
            Sign in
          </Route.Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <Field
          label="Name"
          icon={<User size={16} />}
          name="name"
          required
          maxLength={80}
          autoComplete="name"
          placeholder="Ada Lovelace"
        />
        <UsernameField value={username} onChange={setUsername} onStatus={setUsernameStatus} />
        <Field
          label="Email"
          icon={<Mail size={16} />}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <PasswordField
          icon={<Lock size={16} />}
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          showStrength
        />
        <FormError message={error} />
        <SubmitButton pending={pending}>
          {pending ? 'Creating account…' : 'Create account'}
          {!pending && <ArrowRight size={16} />}
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
