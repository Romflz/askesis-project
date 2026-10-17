// Service worker registration and the install prompt, shared by the root
// layout (registers early), the top bar's Install button and the settings page.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

export function registerPwa() {
  if (typeof window === 'undefined') return
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Not fatal: the app works without it, only reminders and install need it.
    })
  }
  // Chromium fires this once, early; keep it so the Install buttons (top bar,
  // Settings) can show the native prompt later.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as InstallPromptEvent
    listeners.forEach((fn) => fn())
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    markInstalled()
  })
}

/**
 * How this browser installs the app. INSTALL_DETECT_SCRIPT (inlined in the head
 * with TopBar's themeScript) sets it on <html data-install> before first paint,
 * so the Install button is in the server-rendered layout from the start and
 * never pops in. Not set when the app is already running installed.
 *
 * - 'prompt': Chromium (beforeinstallprompt)
 * - 'ios': Share → Add to Home Screen
 * - 'safari': macOS Safari's File → Add to Dock
 * - 'android': other Android browsers (menu → Install)
 * - 'firefox': desktop Firefox, which can't install web apps, so the button explains the alternatives
 * - 'other': anything else
 */
export type InstallMode = 'prompt' | 'ios' | 'safari' | 'android' | 'firefox' | 'other'

const MODES: readonly string[] = ['prompt', 'ios', 'safari', 'android', 'firefox', 'other']

// Minified because it runs inline in every page's head. Regex backslashes are
// doubled so they survive the template literal.
export const INSTALL_DETECT_SCRIPT = `try{var n=navigator,u=n.userAgent,h=document.documentElement;if(!matchMedia('(display-mode: standalone)').matches&&!n.standalone){h.dataset.install=/iPad|iPhone|iPod/.test(u)||(n.platform==='MacIntel'&&n.maxTouchPoints>1)?'ios':'BeforeInstallPromptEvent' in window?'prompt':/Android/.test(u)?'android':/Firefox\\//.test(u)?'firefox':/Macintosh/.test(u)&&/Version\\/(1[7-9]|[2-9]\\d)/.test(u)&&!/Chrome|Chromium|Edg/.test(u)?'safari':'other'}}catch(e){}`

export function installMode(): InstallMode | null {
  const mode = document.documentElement.dataset.install
  return mode && MODES.includes(mode) ? (mode as InstallMode) : null
}

function markInstalled() {
  delete document.documentElement.dataset.install
  listeners.forEach((fn) => fn())
}

/** True once the browser has offered its native install prompt (Chromium-based browsers only). */
export function canInstall(): boolean {
  return deferredPrompt !== null
}

export function onInstallChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false
  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  if (outcome === 'accepted') markInstalled()
  else listeners.forEach((fn) => fn())
  return outcome === 'accepted'
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/** VAPID public keys are base64url; PushManager wants raw bytes. */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}
