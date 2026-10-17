import { type UserSettings, userSettingsInput } from '@askesis/contracts'
import { LocateFixed } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fmtHour } from '../../lib/format.ts'
import { useUserDataMutation } from '../../lib/queries.ts'
import { saveSettings } from '../../server/askesis.functions.ts'
import { Field, type SaveState, SaveStatus, Select, SettingsCard, TextInput } from './fields.tsx'

const HOURS = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: fmtHour(h) }))

/** Daily goal, day rollover, learn-ahead limit and time zone. */
export function StudySettings({ settings }: { settings: UserSettings }) {
  const saveMutation = useUserDataMutation(saveSettings)
  const [goal, setGoal] = useState(String(settings.dailyGoal))
  const [rollover, setRollover] = useState(String(settings.rolloverHour))
  const [learnAhead, setLearnAhead] = useState(String(settings.learnAheadMinutes))
  const [timeZone, setTimeZone] = useState(settings.timeZone)
  const [state, setState] = useState<SaveState>('idle')
  const [detected, setDetected] = useState<string | null>(null)
  const [allZones, setAllZones] = useState<string[]>([])

  // The device's zone and the zone list come from the browser after hydration;
  // server and browser ICU data can differ, which would break hydration.
  useEffect(() => {
    setDetected(Intl.DateTimeFormat().resolvedOptions().timeZone)
    setAllZones(Intl.supportedValuesOf('timeZone'))
  }, [])

  const zones = useMemo(() => {
    const list = allZones.includes(timeZone) ? allZones : [timeZone, ...allZones]
    return list.map((z) => ({ value: z, label: z.replaceAll('_', ' ') }))
  }, [allZones, timeZone])

  // Validated with the API's own schema, so problems show before saving. The
  // reminder hour belongs to the Reminders card and passes through unchanged.
  const parsed = userSettingsInput.safeParse({
    dailyGoal: Number(goal),
    rolloverHour: Number(rollover),
    learnAheadMinutes: Number(learnAhead),
    timeZone,
    reminderHour: settings.reminderHour,
  })
  const errors = parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message]))
  const dirty =
    Number(goal) !== settings.dailyGoal ||
    Number(rollover) !== settings.rolloverHour ||
    Number(learnAhead) !== settings.learnAheadMinutes ||
    timeZone !== settings.timeZone

  async function save() {
    if (!parsed.success) return
    setState('saving')
    try {
      await saveMutation.mutateAsync({ data: parsed.data })
      setState('saved')
    } catch {
      setState('error')
    }
  }

  return (
    <SettingsCard
      id="study"
      eyebrow="Study"
      title="Your daily rhythm"
      description="When your day starts and how much counts as a good day."
      footer={
        <>
          <SaveStatus state={state} />
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={!dirty || !parsed.success || state === 'saving'}
            onClick={save}
          >
            Save
          </button>
        </>
      }
    >
      <div className="field-grid">
        <Field
          label="Daily goal"
          suffix="reviews"
          help="Hitting it completes the ring and pays a +50 XP bonus."
          error={errors.dailyGoal}
        >
          {(p) => <TextInput {...p} type="number" inputMode="numeric" min={10} value={goal} onChange={setGoal} />}
        </Field>
        <Field
          label="Next day starts at"
          help="Reviews before this hour count toward the previous day."
          error={errors.rolloverHour}
        >
          {(p) => <Select {...p} value={rollover} onChange={setRollover} options={HOURS} />}
        </Field>
        <Field
          label="Learn ahead limit"
          suffix="min"
          help="If nothing else is due, learning cards due this soon are shown early."
          error={errors.learnAheadMinutes}
        >
          {(p) => <TextInput {...p} type="number" inputMode="numeric" min={0} value={learnAhead} onChange={setLearnAhead} />}
        </Field>
        <Field
          label="Time zone"
          help={
            detected && detected !== timeZone ? (
              <button type="button" className="link-button" onClick={() => setTimeZone(detected)}>
                <LocateFixed size={13} /> Use this device’s zone ({detected.replaceAll('_', ' ')})
              </button>
            ) : (
              'Decides when your study day and streak roll over.'
            )
          }
          error={errors.timeZone}
        >
          {(p) => <Select {...p} value={timeZone} onChange={setTimeZone} options={zones} />}
        </Field>
      </div>
    </SettingsCard>
  )
}
