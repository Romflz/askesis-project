import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  offset,
  type Placement,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  useRole,
  useTypeahead,
} from '@floating-ui/react'
import clsx from 'clsx'
import { createContext, type HTMLProps, type ReactNode, type Ref, useContext, useMemo, useRef, useState } from 'react'

// Popovers and menus that float above everything: they portal out of scroll
// containers (into <body>, or into the open <dialog> so they share its top
// layer), flip and shift to stay on screen, and close on outside click or Esc.

/** Where floating content mounts. A <Dialog> provides its own root. */
export const PortalRootContext = createContext<HTMLElement | null>(null)

type TriggerProps = Record<string, unknown> & { ref: (node: HTMLElement | null) => void }

/**
 * Shared positioning. `fixed` keeps scrolling ancestors from clipping the panel,
 * and its height is capped to the room left on screen so long lists scroll inside.
 */
function useFloatingBase(placement: Placement, open: boolean, onOpenChange: (open: boolean) => void, matchWidth = false) {
  return useFloating({
    open,
    onOpenChange,
    placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, rects, elements }) {
          elements.floating.style.maxHeight = `${Math.max(160, Math.min(availableHeight, 480))}px`
          if (matchWidth) elements.floating.style.minWidth = `${rects.reference.width}px`
        },
      }),
    ],
  })
}

/**
 * A popover with arbitrary content (pickers, small forms, settings).
 * `trigger` receives the props to spread on the button that opens it.
 */
export function Popover({
  trigger,
  children,
  placement = 'bottom-start',
  label,
  className,
  open: controlledOpen,
  onOpenChange,
  initialFocus = 0,
}: {
  trigger: (props: TriggerProps, open: boolean) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  placement?: Placement
  label: string
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Index of the tabbable element to focus first, or -1 to keep focus on the trigger. */
  initialFocus?: number
}) {
  // Controlled when `open` is passed, otherwise it keeps its own state.
  const [uncontrolled, setUncontrolled] = useState(false)
  const open = controlledOpen ?? uncontrolled
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }
  const root = useContext(PortalRootContext)
  const { refs, floatingStyles, context } = useFloatingBase(placement, open, setOpen)
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'dialog' }),
  ])
  const close = () => setOpen(false)

  return (
    <>
      {trigger({ ref: refs.setReference, ...getReferenceProps() } as TriggerProps, open)}
      {open && (
        <FloatingPortal root={root ?? undefined}>
          <FloatingFocusManager context={context} initialFocus={initialFocus} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={clsx('pop', className)}
              aria-label={label}
              {...getFloatingProps()}
            >
              {typeof children === 'function' ? children(close) : children}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}

// ── Menu ──────────────────────────────────────────────────────────────────────

interface MenuContextValue {
  activeIndex: number | null
  getItemProps: (props?: HTMLProps<HTMLElement>) => Record<string, unknown>
  close: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

/** An action menu: arrow keys move, Enter selects, typing jumps to an item. */
export function Menu({
  trigger,
  children,
  placement = 'bottom-end',
  label,
}: {
  trigger: (props: TriggerProps, open: boolean) => ReactNode
  children: ReactNode
  placement?: Placement
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const root = useContext(PortalRootContext)
  const elementsRef = useRef<(HTMLElement | null)[]>([])
  const labelsRef = useRef<(string | null)[]>([])
  const { refs, floatingStyles, context } = useFloatingBase(placement, open, setOpen)

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    useClick(context, { event: 'mousedown' }),
    useDismiss(context),
    useRole(context, { role: 'menu' }),
    useListNavigation(context, { listRef: elementsRef, activeIndex, onNavigate: setActiveIndex, loop: true }),
    useTypeahead(context, { listRef: labelsRef, activeIndex, onMatch: (i) => open && setActiveIndex(i) }),
  ])

  const value = useMemo(() => ({ activeIndex, getItemProps, close: () => setOpen(false) }), [activeIndex, getItemProps])

  return (
    <>
      {trigger({ ref: refs.setReference, ...getReferenceProps() } as TriggerProps, open)}
      {open && (
        <FloatingPortal root={root ?? undefined}>
          <FloatingFocusManager context={context} initialFocus={0} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="pop pop--menu"
              aria-label={label}
              {...getFloatingProps()}
            >
              <MenuContext value={value}>
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                  {children}
                </FloatingList>
              </MenuContext>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}

/** A menu entry: a link when it has `href`, otherwise a button. */
export function MenuItem({
  children,
  icon,
  onSelect,
  href,
  danger,
  disabled,
  hint,
}: {
  children: string
  icon?: ReactNode
  onSelect?: () => void
  href?: string
  danger?: boolean
  disabled?: boolean
  hint?: string
}) {
  const menu = useContext(MenuContext)!
  // A null label makes typeahead skip disabled items.
  const { ref, index } = useListItem({ label: disabled ? null : children })
  const active = menu.activeIndex === index
  const className = clsx('pop__item', danger && 'is-danger', active && 'is-active')
  const props = menu.getItemProps({
    onClick: () => {
      if (disabled) return
      onSelect?.()
      menu.close()
    },
  })
  const content = (
    <>
      {icon}
      <span className="pop__item-label">{children}</span>
      {hint && <span className="pop__item-hint">{hint}</span>}
    </>
  )
  if (href) {
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        role="menuitem"
        href={href}
        tabIndex={active ? 0 : -1}
        className={className}
        {...props}
      >
        {content}
      </a>
    )
  }
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      role="menuitem"
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      className={className}
      {...props}
    >
      {content}
    </button>
  )
}

export function MenuSeparator() {
  return <div className="pop__sep" role="separator" />
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="pop__label">{children}</div>
}
