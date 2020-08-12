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
          min-width: 240px;
          border-radius: 4px;

          /* https://brumm.af/shadows */
          /* 6, 0.07, 100px, 150px, 0px */
          box-shadow: 0 2.8px 4.2px rgba(0, 0, 0, 0.02),
            0 6.7px 10px rgba(0, 0, 0, 0.028),
            0 12.5px 18.8px rgba(0, 0, 0, 0.035),
            0 22.3px 33.5px rgba(0, 0, 0, 0.042),
            0 41.8px 62.7px rgba(0, 0, 0, 0.05),
            0 100px 150px rgba(0, 0, 0, 0.07);

          ::before,
          ::after {
            content: "";
            display: block;
            height: 8px;
            background-color: #f2f2f2;
            border: solid 1px #aaa;
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
