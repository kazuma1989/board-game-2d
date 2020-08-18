import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"

ContextMenu.Item = MenuItem

export function ContextMenu({
  onOutsideClick,
  className,
  style,
  children,
}: {
  onOutsideClick?(): void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  const ref$ = useOutsideClick<HTMLDivElement>(onOutsideClick)

  return (
    <div
      ref={ref$}
      className={cx(
        css`
          min-width: 264px;
          border-radius: 4px;
          box-shadow: var(--shadow-wide);

          ::before,
          ::after {
            content: "";
            display: block;
            height: 8px;
            background-color: var(--button-bg);
            border: solid 1px var(--button-border);
          }
          ::before {
            border-radius: 4px 4px 0 0;
            border-bottom-color: transparent;
          }
          ::after {
            border-radius: 0 0 4px 4px;
            border-top-color: transparent;
          }
        `,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  )
}

function MenuItem({
  children,
  ...props
}: {
  disabled?: boolean
  onClick?(): void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={css`
        display: block;
        width: 100%;
        border-radius: 0;
        border-top-color: transparent;
        border-bottom-color: transparent;
        text-align: initial;
        font-size: smaller;
      `}
      {...props}
    >
      {children}
    </button>
  )
}

function useOutsideClick<E extends Element>(onOutsideClick?: () => void) {
  const onOutsideClick$ = useRef(onOutsideClick)
  useEffect(() => {
    onOutsideClick$.current = onOutsideClick
  })

  const container$ = useRef<E>(null)
  useEffect(() => {
    let click
    document.addEventListener(
      "click",
      (click = (e: MouseEvent) => {
        if (!(e.target instanceof Element)) return

        if (!container$.current?.contains(e.target)) {
          onOutsideClick$.current?.()
        }
      }),
      { passive: true },
    )

    return () => {
      document.removeEventListener("click", click)
    }
  }, [])

  return container$
}
