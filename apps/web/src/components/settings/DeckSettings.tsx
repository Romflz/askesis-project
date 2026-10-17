import type { DeckPreset, DeckSummary, SessionUser } from '@askesis/contracts'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import clsx from 'clsx'
import { Database, LogOut } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '../../lib/auth-client.ts'
import { fmtInt } from '../../lib/format.ts'
import { clearUserData, useUserDataMutation } from '../../lib/queries.ts'
import { assignDeckPreset, loadSampleData } from '../../server/askesis.functions.ts'
import { UsernameField, type UsernameStatus, usernameReady } from '../auth/UsernameField.tsx'
import { type SaveState, SaveStatus, Select, SettingsCard } from './fields.tsx'

/** Picks the scheduling preset for each deck, listed as an indented tree. */
export function DeckAssignments({ decks, presets }: { decks: DeckSummary[]; presets: DeckPreset[] }) {
  const assignMutation = useUserDataMutation(assignDeckPreset)
  const [state, setState] = useState<SaveState>('idle')
  const options = presets.map((p) => ({ value: p.id, label: p.isDefault ? `${p.name} (default)` : p.name }))

  const depth = (d: DeckSummary): number => {
    const parent = decks.find((p) => p.id === d.parentId)
    return parent ? depth(parent) + 1 : 0
  }

  // Parents first, children right after them.
  const ordered: DeckSummary[] = []
  const visit = (parentId: string | null) => {
    for (const d of decks.filter((x) => x.parentId === parentId)) {
      ordered.push(d)
      visit(d.id)
    }
  }
  visit(null)

  async function assign(deckId: string, presetId: string) {
    setState('saving')
    try {
      await assignMutation.mutateAsync({ data: { deckId, presetId } })
      setState('saved')
    } catch {
      setState('error')
    }
  }

  return (
    <SettingsCard
      id="decks"
      eyebrow="Decks"
      title="Which preset each deck uses"
      description="Subdecks don’t inherit; each deck picks its own preset."
      footer={<SaveStatus state={state} />}
    >
      {ordered.length === 0 ? (
        <p className="settings-empty">No decks yet.</p>
      ) : (
        <ul className="deck-assign">
          {ordered.map((d) => (
            <li key={d.id} className="deck-assign__row" style={{ '--depth': depth(d) } as React.CSSProperties}>
              <div className="deck-assign__name">
                <span>{d.name}</span>
                <span className="deck-assign__count">{fmtInt(d.cards)} cards</span>
              </div>
              <Select
                aria-label={`Preset for ${d.name}`}
                value={d.presetId}
                onChange={(presetId) => assign(d.id, presetId)}
                options={options}
              />
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  )
}

/** Replaces the collection with simulated history, behind a confirm step. */
export function SampleData() {
  const navigate = useNavigate()
  const sample = useUserDataMutation(loadSampleData)
  const [stage, setStage] = useState<'idle' | 'confirm' | 'loading' | 'error'>('idle')

  // The first click only asks for confirmation; the second one runs.
  async function run() {
    if (stage === 'idle' || stage === 'error') return setStage('confirm')
    setStage('loading')
    try {
      await sample.mutateAsync(undefined)
      await navigate({ to: '/dashboard' })
    } catch {
      setStage('error')
    }
  }

  return (
    <SettingsCard
      id="sample"
      eyebrow="Sample data"
      title="Try it with a year of history"
      description="Replace your collection with ~11 months of simulated reviews (about 13,500 cards across 7 decks) to see every chart and trophy in action. Your decks, cards and review history are deleted; settings and presets are kept."
    >
      <div className="sample-row">
        <Database size={18} />
        <button
          type="button"
          className={clsx('btn btn--sm', stage === 'confirm' ? 'btn--danger' : 'btn--ghost')}
          onClick={run}
          disabled={stage === 'loading'}
        >
          {stage === 'confirm'
            ? 'Delete my collection and load sample data'
            : stage === 'loading'
              ? 'Simulating 11 months…'
              : 'Load sample history'}
        </button>
        {stage === 'confirm' && (
          <button type="button" className="link-button" onClick={() => setStage('idle')}>
            Cancel
          </button>
        )}
        {stage === 'error' && <span className="save-status save-status--error">Something went wrong. Try again.</span>}
      </div>
    </SettingsCard>
  )
}

/** Name, email, username and sign out. */
export function AccountCard({ user }: { user: SessionUser }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [username, setUsername] = useState(user.username ?? '')
  const [status, setStatus] = useState<UsernameStatus>('idle')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | undefined>()
  const changed = username.trim() !== (user.username ?? '')

  async function saveUsername() {
    if (!usernameReady(status) || !changed) return
    setSaveState('saving')
    const handle = username.trim()
    const { error } = await authClient.updateUser({ username: handle, displayUsername: handle })
    if (error) {
      setError(error.message ?? undefined)
      return setSaveState('error')
    }
    setSaveState('saved')
    await router.invalidate()
  }

  return (
    <SettingsCard
      id="account"
      eyebrow="Account"
      title={user.name}
      description={user.username ? `@${user.username} · ${user.email}` : user.email}
      footer={
        <>
          <SaveStatus state={saveState} error={error} />
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={!changed || !usernameReady(status) || saveState === 'saving'}
            onClick={saveUsername}
          >
            Save username
          </button>
        </>
      }
    >
      <div className="account-row">
        <UsernameField value={username} onChange={setUsername} onStatus={setStatus} current={user.username} variant="settings" />
        <button
          type="button"
          className="btn btn--ghost btn--sm account-row__signout"
          onClick={async () => {
            await authClient.signOut()
            clearUserData(queryClient)
            await router.invalidate()
            await router.navigate({ to: '/' })
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </SettingsCard>
  )
}
