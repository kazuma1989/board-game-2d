import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useState } from "https://cdn.skypack.dev/react"
import { useScale } from "./useScale.js"

export function Card({
  col,
  row,
  index,
  locked,
  text,
  src,
  onMoveStart,
  onMoveEnd,
  className,
  style,
  ...props
}: {
  col: number
  row: number
  /**
   * Pile 内での 0 始まりの順序。大きいほど「上」に積み重なっている
   */
  index: number
  locked?: boolean

  text?: string
  src?: string

  onMoveStart?(): void
  onMoveEnd?(dest: { col: number; row: number; x: number; y: number }): void

  className?: string
  style?: any
}) {
  const { left, top } = {
    left: -3 * index,
    top: -2 * index,
  }

  const [dragging, setDragging] = useState(false)
  const scale$ = useScale()

  return (
    <div
      onPointerDown={e => {
        if (!e.isPrimary) return
        if (locked) return

        setDragging(true)

        const { currentTarget: target, pointerType, pointerId } = e

        if (pointerType === "mouse") {
          target.setPointerCapture(pointerId)
        }

        let { clientX, clientY } = e
        let translateX = col * 50
        let translateY = row * 50

        const pointermove = (ev: PointerEvent) => {
          translateX += (ev.clientX - clientX) / scale$.current
          translateY += (ev.clientY - clientY) / scale$.current

          clientX = ev.clientX
          clientY = ev.clientY

          target.style.transform = `translate(${translateX}px, ${translateY}px)`
        }

        target.addEventListener("pointermove", pointermove, { passive: true })

        target.addEventListener(
          "pointerup",
          () => {
            target.removeEventListener("pointermove", pointermove)

            setDragging(false)

            target.style.transform = ""

            if (pointerType === "mouse") {
              target.releasePointerCapture(pointerId)
            }

            const centerX = translateX + 25
            const centerY = translateY + 25
            const col = (centerX - (centerX % 50)) / 50
            const row = (centerY - (centerY % 50)) / 50
            onMoveEnd?.({
              col,
              row,
              x: translateX,
              y: translateY,
            })
          },
          { once: true, passive: true },
        )

        onMoveStart?.()
      }}
      className={cx(
        css`
          transform: translate(${col * 50 + left}px, ${row * 50 + top}px);
        `,
        css`
          position: absolute;
          left: 0;
          top: 0;
        `,
        !locked &&
          css`
            cursor: grab;
          `,
        locked &&
          css`
            cursor: not-allowed;
          `,
        !dragging &&
          css`
            transition: transform 400ms;
          `,
        dragging &&
          css`
            z-index: 100;
            cursor: grabbing;
          `,
        css`
          width: 50px;
          height: 76.5px;
          border-radius: 4px;
          box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.4);
        `,
        src &&
          css`
            background-image: url("${src}");
            background-size: cover;
            background-repeat: no-repeat;
          `,
        className,
      )}
      style={style}
      {...props}
    >
      {text}
    </div>
  )
}
