import clsx from 'clsx'
import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { PortalRootContext } from './Popover.tsx'

/**
 * A native <dialog> shown modally: focus is trapped and Esc closes it for free.
 * `drawer` slides in from the right on wide screens; both go full-screen on phones.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'modal',
  className,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'modal' | 'drawer'
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  // Popovers opened inside the dialog mount here, so they share its top layer.
  const [portalRoot, setPortalRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={clsx('dlg', `dlg--${size}`, `dlg--${variant}`, className)}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        // Esc closes an open popover first, not the whole dialog.
        if (portalRoot?.querySelector('.pop')) return
        onClose()
      }}
      onMouseDown={(e) => {
        // A press on the backdrop lands on the <dialog> element itself.
        if (e.target === ref.current) onClose()
      }}
    >
      {open && (
        <PortalRootContext value={portalRoot}>
          <div className="dlg__inner">
            <header className="dlg__header">
              <div>
                <h2 id={titleId} className="dlg__title">
                  {title}
                </h2>
                {description && <p className="dlg__description">{description}</p>}
              </div>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={17} />
              </button>
            </header>
            <div className="dlg__body">{children}</div>
            {footer && <footer className="dlg__footer">{footer}</footer>}
          </div>
        </PortalRootContext>
      )}
      <div ref={setPortalRoot} className="dlg__portal" />
    </dialog>
  )
}
