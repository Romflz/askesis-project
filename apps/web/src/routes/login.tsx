import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ArrowRight, AtSign, Lock } from 'lucide-react'
import { useState } from 'react'
import { capture } from '../lib/analytics.ts'
import { AuthShell } from '../components/auth/AuthShell.tsx'
import { authErrorMessage, Field, FormError, PasswordField, SubmitButton } from '../components/auth/fields.tsx'
import { authClient } from '../lib/auth-client.ts'
import { clearUserData } from '../lib/queries.ts'
import { redirectSearch } from '../lib/safe-redirect.ts'

export const Route = createFileRoute('/login')({
  staticData: { ownChrome: true },
  validateSearch: redirectSearch,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: search.redirect ?? '/dashboard' })
  },
  head: () => ({ meta: [{ title: 'Sign in · Askesis' }, { name: 'robots', content: 'noindex' }] }),
  component: Login,
})

function Login() {
  const { redirect: target } = Route.useSearch()
  const router = useRouter()
  const queryClient = useQueryClient()
  const next = target ?? '/dashboard'
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending(true)
    setError(null)
    // One field takes either: anything with an @ is an email, otherwise a username.
    const identifier = String(form.get('identifier')).trim()
    const password = String(form.get('password'))
    const { error } = identifier.includes('@')
      ? await authClient.signIn.email({ email: identifier, password })
      : await authClient.signIn.username({ username: identifier, password })
    if (error) {
      setPending(false)
      return setError(authErrorMessage(error))
    }
    // Nothing cached for a previous account may show; then re-run beforeLoad (session) everywhere and continue.
    clearUserData(queryClient)
    await router.invalidate()
    capture('user_signed_in')
    await router.navigate({ href: next })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up your streak where you left it."
      footer={
        <>
          New to Askesis?{' '}
          <Route.Link to="/register" search={{ redirect: target }}>
            Create an account
          </Route.Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <Field
          label="Email or username"
          icon={<AtSign size={16} />}
          name="identifier"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com or ada_lovelace"
        />
        <PasswordField icon={<Lock size={16} />} name="password" required minLength={8} autoComplete="current-password" />
        <FormError message={error} />
        <SubmitButton pending={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
          {!pending && <ArrowRight size={16} />}
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
