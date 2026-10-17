import type { UserSettings } from '@askesis/contracts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BellOff, BellRing, Download, Send, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fmtHour } from '../../lib/format.ts'
import { queries, useUserDataMutation } from '../../lib/queries.ts'
import { canInstall, isStandalone, onInstallChange, promptInstall, pushSupported, urlBase64ToUint8Array } from '../../lib/pwa.ts'
import { saveSettings, sendTestPush, subscribePush, unsubscribePush } from '../../server/askesis.functions.ts'
import { Field, Select, SettingsCard } from './fields.tsx'

/** Push reminder state on this device; `disabled-server` means the API has no VAPID keys. */
type Status = 'loading' | 'unsupported' | 'disabled-server' | 'denied' | 'off' | 'on'

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}

/** Daily push reminders for this device, the app install prompt, and the reminder hour. */
export function NotificationsCard({ settings }: { settings: UserSettings }) {
  const queryClient = useQueryClient()
  const subscribe = useUserDataMutation(subscribePush)
  const unsubscribe = useUserDataMutation(unsubscribePush)
  const saveHour = useUserDataMutation(saveSettings)
  const testPush = useMutation({ mutationFn: sendTestPush })
  const [status, setStatus] = useState<Status>('loading')
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [installable, setInstallable] = useState(false)
  // Assume a browser tab until the effect checks; most visitors aren't in the installed app.
  const [standalone, setStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)

  // Push support, permission and install state exist only in the browser, so read them after mount.
  useEffect(() => {
    setStandalone(isStandalone())
    setIsIos(/iPhone|iPad|iPod/.test(navigator.userAgent))
    setInstallable(canInstall())
    const off = onInstallChange(() => setInstallable(canInstall()))

    void (async () => {
      if (!pushSupported()) return setStatus('unsupported')
      const server = await queryClient.fetchQuery(queries.pushStatus())
      if (!server.enabled || !server.publicKey) return setStatus('disabled-server')
      setPublicKey(server.publicKey)
      if (Notification.permission === 'denied') return setStatus('denied')
      setStatus((await currentSubscription()) ? 'on' : 'off')
    })().catch(() => setStatus('unsupported'))
    return off
  }, [queryClient])

  async function enable() {
    if (!publicKey) return
    setBusy(true)
    setMessage(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'off')
        return
      }
      // Reuse this browser's subscription if it has one; otherwise subscribe with the server's key.
      const registration = await navigator.serviceWorker.ready
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }))
      const json = subscription.toJSON()
      await subscribe.mutateAsync({
        data: { endpoint: json.endpoint!, keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! } },
      })
      setStatus('on')
      setMessage('Reminders are on for this device.')
    } catch {
      setMessage('Couldn’t turn on reminders. Try again, or check the browser’s site settings.')
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      const subscription = await currentSubscription()
      if (subscription) {
        await unsubscribe.mutateAsync({ data: { endpoint: subscription.endpoint } })
        await subscription.unsubscribe()
      }
      setStatus('off')
      setMessage('Reminders are off for this device.')
    } catch {
      setMessage('Couldn’t turn off reminders. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  async function test() {
    setBusy(true)
    try {
      const { sent } = await testPush.mutateAsync(undefined)
      setMessage(
        sent > 0 ? 'Test sent. It should arrive in a few seconds.' : 'No device received it. Try turning reminders off and on.',
      )
    } catch {
      setMessage('Couldn’t send a test right now.')
    } finally {
      setBusy(false)
    }
  }

  async function setHour(value: string) {
    try {
      await saveHour.mutateAsync({ data: { ...settings, reminderHour: value === 'reset' ? null : Number(value) } })
    } catch {
      setMessage('Couldn’t save the reminder time. Try again in a moment.')
    }
  }

  // Either the day rollover or any hour from 6 AM to 11 PM.
  const hourOptions = [
    { value: 'reset', label: `When my day resets (${fmtHour(settings.rolloverHour)})` },
    ...Array.from({ length: 18 }, (_, i) => i + 6).map((h) => ({ value: String(h), label: fmtHour(h) })),
  ]

  return (
    <SettingsCard
      id="notifications"
      eyebrow="Reminders"
      title="A daily nudge to study"
      description="Install Askesis as an app and get one push notification a day, at the hour you choose, with what’s due and your streak. Nothing is sent on days with nothing due."
    >
      <div className="notify">
        <div className={`notify__status notify__status--${status}`}>
          {status === 'on' ? <BellRing size={18} /> : <BellOff size={18} />}
          <div>
            <p className="notify__title">
              {
                {
                  loading: 'Checking this device…',
                  unsupported: 'This browser can’t receive push notifications',
                  'disabled-server': 'Reminders aren’t configured on this server',
                  denied: 'Notifications are blocked for Askesis',
                  off: 'Reminders are off on this device',
                  on: 'Reminders are on for this device',
                }[status]
              }
            </p>
            <p className="notify__detail">
              {status === 'unsupported' && isIos && !standalone
                ? 'On iPhone and iPad, tap Share → Add to Home Screen, then open Askesis from your home screen.'
                : status === 'disabled-server'
                  ? 'Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env (pnpm --filter @askesis/api vapid) and restart the API.'
                  : status === 'denied'
                    ? 'Allow notifications for this site in your browser settings, then reload.'
                    : (message ?? 'Works in installed apps and in desktop browsers.')}
            </p>
          </div>
        </div>

        <div className="notify__actions">
          {status === 'off' && (
            <button type="button" className="btn btn--primary btn--sm" onClick={enable} disabled={busy}>
              <BellRing size={15} /> Turn on reminders
            </button>
          )}
          {status === 'on' && (
            <>
              <button type="button" className="btn btn--ghost btn--sm" onClick={test} disabled={busy}>
                <Send size={14} /> Send a test
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={disable} disabled={busy}>
                <BellOff size={14} /> Turn off here
              </button>
            </>
          )}
          {installable && !standalone && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void promptInstall()}>
              <Download size={14} /> Install app
            </button>
          )}
          {standalone && (
            <span className="chip">
              <Smartphone size={13} /> Running as an app
            </span>
          )}
        </div>
      </div>

      <div className="field-grid notify__time">
        <Field label="Remind me" help="In your time zone. One reminder a day, only when cards are due.">
          {(p) => (
            <Select
              {...p}
              value={settings.reminderHour === null ? 'reset' : String(settings.reminderHour)}
              onChange={setHour}
              options={hourOptions}
            />
          )}
        </Field>
      </div>
    </SettingsCard>
  )
}
