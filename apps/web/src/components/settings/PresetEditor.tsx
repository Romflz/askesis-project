import { DEFAULT_PRESET, type DeckPreset, type DeckPresetInput, deckPresetInput } from '@askesis/contracts'
import { answer, formatInterval, type Memory, newMemory, type Rating, RATINGS } from '@askesis/core'
import clsx from 'clsx'
import { BrainCircuit, Copy, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useUserDataMutation } from '../../lib/queries.ts'
import { createPreset, deletePreset, updatePreset } from '../../server/askesis.functions.ts'
import { Field, type SaveState, SaveStatus, Select, SettingsCard, Switch, TextInput } from './fields.tsx'

// ── Form state: strings while editing, parsed and validated on save ──────────

interface PresetForm {
  name: string
  newPerDay: string
  reviewsPerDay: string
  learningSteps: string
  graduatingInterval: string
  easyInterval: string
  newCardOrder: DeckPresetInput['newCardOrder']
  relearningSteps: string
  minimumInterval: string
  leechThreshold: string
  leechAction: DeckPresetInput['leechAction']
  maximumInterval: string
  startingEase: string
  easyBonus: string
  intervalModifier: string
  hardInterval: string
  newInterval: string
  fsrs: boolean
  desiredRetention: string
}

/** Ratios are edited as whole percentages: 2.5 → "250". */
const pct = (x: number) => String(Math.round(x * 100))

function toForm(p: DeckPresetInput): PresetForm {
  return {
    name: p.name,
    newPerDay: String(p.newPerDay),
    reviewsPerDay: String(p.reviewsPerDay),
    learningSteps: p.learningSteps.join(' '),
    graduatingInterval: String(p.graduatingInterval),
    easyInterval: String(p.easyInterval),
    newCardOrder: p.newCardOrder,
    relearningSteps: p.relearningSteps.join(' '),
    minimumInterval: String(p.minimumInterval),
    leechThreshold: String(p.leechThreshold),
    leechAction: p.leechAction,
    maximumInterval: String(p.maximumInterval),
    startingEase: pct(p.startingEase),
    easyBonus: pct(p.easyBonus),
    intervalModifier: pct(p.intervalModifier),
    hardInterval: pct(p.hardInterval),
    newInterval: pct(p.newInterval),
    fsrs: p.fsrs,
    desiredRetention: pct(p.desiredRetention),
  }
}

const steps = (s: string) => s.split(/[\s,]+/).filter(Boolean)
// A blank field becomes NaN rather than 0, so it fails validation instead of saving a zero.
const num = (s: string) => (s.trim() === '' ? Number.NaN : Number(s))

/** Validates the form with the API's schema; errors are keyed by field, first message wins. */
function fromForm(f: PresetForm) {
  const result = deckPresetInput.safeParse({
    name: f.name,
    newPerDay: num(f.newPerDay),
    reviewsPerDay: num(f.reviewsPerDay),
    learningSteps: steps(f.learningSteps),
    graduatingInterval: num(f.graduatingInterval),
    easyInterval: num(f.easyInterval),
    newCardOrder: f.newCardOrder,
    relearningSteps: steps(f.relearningSteps),
    minimumInterval: num(f.minimumInterval),
    leechThreshold: num(f.leechThreshold),
    leechAction: f.leechAction,
    maximumInterval: num(f.maximumInterval),
    startingEase: num(f.startingEase) / 100,
    easyBonus: num(f.easyBonus) / 100,
    intervalModifier: num(f.intervalModifier) / 100,
    hardInterval: num(f.hardInterval) / 100,
    newInterval: num(f.newInterval) / 100,
    fsrs: f.fsrs,
    desiredRetention: num(f.desiredRetention) / 100,
  })
  if (result.success) return { data: result.data, errors: {} as Record<string, string> }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0])
    errors[key] ??= issue.code === 'invalid_type' ? 'Enter a number' : issue.message
  }
  return { data: null, errors }
}

// ── Preview: when cards come back under these settings ───────────────────────

/**
 * Follows a new card through a run of answers, each given the moment the card is
 * due, and returns the wait before each next review. No fuzz, so it's repeatable.
 */
function walk(preset: DeckPresetInput, ratings: Rating[]): string[] {
  let m: Memory = newMemory(new Date())
  let now = new Date()
  return ratings.map((rating) => {
    const next = answer(m, rating, now, preset, { fuzz: false })
    const label = formatInterval(next.due.getTime() - now.getTime())
    now = next.due
    m = next
    return label
  })
}

/** What each rating would do to a review card last seen `days` ago, at its due date. */
function reviewOf(preset: DeckPresetInput, days: number): Record<Rating, string> {
  const now = new Date()
  // A typical mature card: SM-2 reads interval and ease; FSRS reads stability and difficulty.
  const card: Memory = {
    ...newMemory(now),
    state: 2,
    interval: days,
    ease: preset.startingEase,
    stability: days,
    difficulty: 5,
    reps: 6,
    lastReview: new Date(now.getTime() - days * 86_400_000),
    due: now,
  }
  const out = {} as Record<Rating, string>
  for (const { rating } of RATINGS) {
    out[rating] = formatInterval(answer(card, rating, now, preset, { fuzz: false }).due.getTime() - now.getTime())
  }
  return out
}

function Preview({ preset }: { preset: DeckPresetInput }) {
  const scenarios = useMemo(
    () => [
      { label: 'New card, Good every time', chain: walk(preset, [3, 3, 3, 3, 3, 3, 3]) },
      { label: 'New card, Again first', chain: walk(preset, [1, 3, 3, 3, 3, 3]) },
      { label: 'New card, Easy on sight', chain: walk(preset, [4, 3, 3, 3, 3]) },
    ],
    [preset],
  )
  const review = useMemo(() => reviewOf(preset, 30), [preset])

  return (
    <aside className="preset-preview" aria-label="Interval preview">
      <p className="eyebrow">
        <BrainCircuit size={13} /> When cards come back
      </p>
      {scenarios.map((s) => (
        <div key={s.label} className="preset-preview__scenario">
          <p className="preset-preview__label">{s.label}</p>
          <ol className="interval-chain">
            {s.chain.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
      <div className="preset-preview__scenario">
        <p className="preset-preview__label">A card last seen 30 days ago</p>
        <div className="preset-preview__review">
          {RATINGS.map(({ rating, label, key }) => (
            <div key={rating} className={`review-cell review-cell--${key}`}>
              <span className="review-cell__value tabular">{review[rating]}</span>
              <span className="review-cell__label">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="preset-preview__note">
        {preset.fsrs
          ? 'FSRS adapts to each card’s history; this shows a typical card.'
          : 'Exact timings for these settings (before fuzz).'}
      </p>
    </aside>
  )
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function PresetEditor({ presets, deckCount }: { presets: DeckPreset[]; deckCount: Record<string, number> }) {
  const savePreset = useUserDataMutation(updatePreset)
  const addPreset = useUserDataMutation(createPreset)
  // Back to the default preset before the list refetches without the deleted one.
  const removePreset = useUserDataMutation(deletePreset, {
    onSuccess: () => setSelectedId(presets.find((p) => p.isDefault)?.id),
  })
  const [selectedId, setSelectedId] = useState(presets.find((p) => p.isDefault)?.id ?? presets[0]?.id)
  const selected = presets.find((p) => p.id === selectedId) ?? presets[0]!
  const [form, setForm] = useState(() => toForm(selected))
  const [baseline, setBaseline] = useState(() => toForm(selected))
  const [state, setState] = useState<SaveState>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setForm(toForm(selected))
    setBaseline(toForm(selected))
    setState('idle')
    setConfirmDelete(false)
    // Only when switching presets; saving keeps the form as typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id])

  const { data, errors } = fromForm(form)
  // The preview keeps showing the last valid settings while a field is mid-edit.
  const [lastValid, setLastValid] = useState<DeckPresetInput>(selected)
  useEffect(() => {
    if (data) setLastValid(data)
    // `data` is a fresh object each render; the form is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline)
  const set =
    <K extends keyof PresetForm>(key: K) =>
    (value: PresetForm[K]) => {
      setForm((f) => ({ ...f, [key]: value }))
      setState('idle')
    }

  function select(id: string) {
    if (id === selected.id) return
    if (dirty && !window.confirm('Discard unsaved changes to this preset?')) return
    setSelectedId(id)
  }

  async function save() {
    if (!data) return
    setState('saving')
    try {
      await savePreset.mutateAsync({ data: { id: selected.id, preset: data } })
      setBaseline(form)
      setState('saved')
    } catch {
      setState('error')
    }
  }

  async function create(from: DeckPresetInput, name: string) {
    if (dirty && !window.confirm('Discard unsaved changes to this preset?')) return
    const created = await addPreset.mutateAsync({ data: { ...from, name } })
    setSelectedId(created.id)
  }

  async function remove() {
    if (!confirmDelete) return setConfirmDelete(true)
    await removePreset.mutateAsync({ data: { id: selected.id } })
  }

  return (
    <SettingsCard
      id="presets"
      eyebrow="Deck presets"
      title="How cards come back"
      description="A preset is a set of scheduling options shared by any number of decks. New accounts start on the defaults."
    >
      <div className="preset-tabs" role="tablist" aria-label="Presets">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === selected.id}
            className="preset-tab"
            onClick={() => select(p.id)}
          >
            <span>{p.name}</span>
            <span className="preset-tab__meta">
              {p.isDefault ? 'Default · ' : ''}
              {deckCount[p.id] ?? 0} {deckCount[p.id] === 1 ? 'deck' : 'decks'}
            </span>
          </button>
        ))}
        <button type="button" className="preset-tab preset-tab--add" onClick={() => create(DEFAULT_PRESET, 'New preset')}>
          <Plus size={15} /> New preset
        </button>
      </div>

      <div className="preset-editor">
        <form
          className="preset-form"
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <Field label="Preset name" error={errors.name}>
            {(p) => <TextInput {...p} value={form.name} onChange={set('name')} maxLength={60} />}
          </Field>

          <fieldset className="preset-group">
            <legend>Daily limits</legend>
            <div className="field-grid">
              <Field label="New cards per day" error={errors.newPerDay} help="Default: 20">
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.newPerDay}
                    onChange={set('newPerDay')}
                  />
                )}
              </Field>
              <Field label="Maximum reviews per day" error={errors.reviewsPerDay} help="Default: 200">
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.reviewsPerDay}
                    onChange={set('reviewsPerDay')}
                  />
                )}
              </Field>
            </div>
          </fieldset>

          <fieldset className="preset-group">
            <legend>New cards</legend>
            <div className="field-grid">
              <Field
                label="Learning steps"
                error={errors.learningSteps}
                help="Same-day delays before a card graduates, separated by spaces. Default: 1m 10m"
                className="field--wide"
              >
                {(p) => (
                  <TextInput
                    {...p}
                    value={form.learningSteps}
                    onChange={set('learningSteps')}
                    placeholder="1m 10m"
                    spellCheck={false}
                  />
                )}
              </Field>
              <Field
                label="Graduating interval"
                suffix="days"
                error={errors.graduatingInterval}
                help="After the last step. Default: 1"
              >
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.graduatingInterval}
                    onChange={set('graduatingInterval')}
                  />
                )}
              </Field>
              <Field
                label="Easy interval"
                suffix="days"
                error={errors.easyInterval}
                help="Easy on a new card skips the steps. Default: 4"
              >
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.easyInterval}
                    onChange={set('easyInterval')}
                  />
                )}
              </Field>
              <Field label="Insertion order" help="Which new cards are introduced first.">
                {(p) => (
                  <Select
                    {...p}
                    value={form.newCardOrder}
                    onChange={(v) => set('newCardOrder')(v as PresetForm['newCardOrder'])}
                    options={[
                      { value: 'sequential', label: 'Sequential (oldest first)' },
                      { value: 'random', label: 'Random' },
                    ]}
                  />
                )}
              </Field>
            </div>
          </fieldset>

          <fieldset className="preset-group">
            <legend>Lapses</legend>
            <div className="field-grid">
              <Field
                label="Relearning steps"
                error={errors.relearningSteps}
                help="Delays after you forget a review card. Default: 10m"
                className="field--wide"
              >
                {(p) => (
                  <TextInput
                    {...p}
                    value={form.relearningSteps}
                    onChange={set('relearningSteps')}
                    placeholder="10m"
                    spellCheck={false}
                  />
                )}
              </Field>
              <Field
                label="Minimum interval"
                suffix="days"
                error={errors.minimumInterval}
                help="Floor for a forgotten card. Default: 1"
              >
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.minimumInterval}
                    onChange={set('minimumInterval')}
                  />
                )}
              </Field>
              <Field
                label="Leech threshold"
                suffix="lapses"
                error={errors.leechThreshold}
                help="Cards forgotten this often are leeches. Default: 8"
              >
                {(p) => (
                  <TextInput
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={form.leechThreshold}
                    onChange={set('leechThreshold')}
                  />
                )}
              </Field>
              <Field label="Leech action">
                {(p) => (
                  <Select
                    {...p}
                    value={form.leechAction}
                    onChange={(v) => set('leechAction')(v as PresetForm['leechAction'])}
                    options={[
                      { value: 'tag', label: 'Tag only' },
                      { value: 'suspend', label: 'Suspend card' },
                    ]}
                  />
                )}
              </Field>
            </div>
          </fieldset>

          <fieldset className="preset-group">
            <legend>Scheduler</legend>
            <Switch
              checked={form.fsrs}
              onChange={set('fsrs')}
              label="Use FSRS"
              description="Predicts when you’ll forget each card instead of using fixed multipliers. Off by default."
            />
            {form.fsrs ? (
              <div className="field-grid">
                <Field
                  label="Desired retention"
                  suffix="%"
                  error={errors.desiredRetention}
                  help="Higher means more reviews. Default: 90%"
                  className="field--wide"
                >
                  {(p) => (
                    <div className="range-row">
                      <input
                        {...p}
                        type="range"
                        className="range"
                        min={70}
                        max={99}
                        value={Number(form.desiredRetention) || 90}
                        onChange={(e) => set('desiredRetention')(e.target.value)}
                      />
                      <span className="range-row__value tabular">{form.desiredRetention}%</span>
                    </div>
                  )}
                </Field>
                <Field label="Maximum interval" suffix="days" error={errors.maximumInterval} help="Default: 36500 (100 years)">
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={form.maximumInterval}
                      onChange={set('maximumInterval')}
                    />
                  )}
                </Field>
              </div>
            ) : (
              <div className="field-grid">
                <Field
                  label="Starting ease"
                  suffix="%"
                  error={errors.startingEase}
                  help="Growth factor for new cards. Default: 250%"
                >
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={131}
                      value={form.startingEase}
                      onChange={set('startingEase')}
                    />
                  )}
                </Field>
                <Field label="Easy bonus" suffix="%" error={errors.easyBonus} help="Extra multiplier for Easy. Default: 130%">
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={100}
                      value={form.easyBonus}
                      onChange={set('easyBonus')}
                    />
                  )}
                </Field>
                <Field label="Hard interval" suffix="%" error={errors.hardInterval} help="Multiplier for Hard. Default: 120%">
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={50}
                      value={form.hardInterval}
                      onChange={set('hardInterval')}
                    />
                  )}
                </Field>
                <Field
                  label="Interval modifier"
                  suffix="%"
                  error={errors.intervalModifier}
                  help="Scales every review interval. Default: 100%"
                >
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={50}
                      value={form.intervalModifier}
                      onChange={set('intervalModifier')}
                    />
                  )}
                </Field>
                <Field
                  label="New interval"
                  suffix="%"
                  error={errors.newInterval}
                  help="Share of the old interval kept after a lapse. Default: 0%"
                >
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={form.newInterval}
                      onChange={set('newInterval')}
                    />
                  )}
                </Field>
                <Field label="Maximum interval" suffix="days" error={errors.maximumInterval} help="Default: 36500 (100 years)">
                  {(p) => (
                    <TextInput
                      {...p}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={form.maximumInterval}
                      onChange={set('maximumInterval')}
                    />
                  )}
                </Field>
              </div>
            )}
          </fieldset>

          <div className="preset-actions">
            <div className="preset-actions__secondary">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setForm({ ...toForm(DEFAULT_PRESET), name: form.name })}
              >
                <RotateCcw size={14} /> Reset to defaults
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => data && create(data, `${data.name} copy`)}
                disabled={!data}
              >
                <Copy size={14} /> Duplicate
              </button>
              {!selected.isDefault && (
                <button type="button" className={clsx('btn btn--ghost btn--sm', confirmDelete && 'btn--danger')} onClick={remove}>
                  <Trash2 size={14} /> {confirmDelete ? 'Click to confirm' : 'Delete'}
                </button>
              )}
            </div>
            <div className="preset-actions__primary">
              <SaveStatus state={state} />
              <button type="submit" className="btn btn--primary btn--sm" disabled={!dirty || !data || state === 'saving'}>
                Save preset
              </button>
            </div>
          </div>
        </form>

        <Preview preset={data ?? lastValid} />
      </div>
    </SettingsCard>
  )
}
