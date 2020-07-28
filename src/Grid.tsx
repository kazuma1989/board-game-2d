import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useRef, useState } from "https://cdn.skypack.dev/preact/compat"
import { mode } from "./mode.js"

export function Grid({
  onDrop,
  onMove,
  className,
  ...props
}: {
  onDrop?(dest: { col: number; row: number; x: number; y: number }): void
  onMove?(dest: { col: number; row: number; x: number; y: number }): void
  className?: string
  style?: any
}) {
  const container$ = useRef<HTMLDivElement>()

  const [dragging, setDragging] = useState(false)
  const draggingPosition$ = useRef({ x: 0, y: 0 })

  return (
    <div
      ref={container$}
      onMouseDown={e => {}}
      onMouseMove={e => {
        if (!e.shiftKey) return

        const { offsetX: x, offsetY: y } = e
        onMove?.({
          col: (x - (x % 50)) / 50,
          row: (y - (y % 50)) / 50,
          x,
          y,
        })
      }}
      onMouseUp={e => {}}
      onDragOver={e => {
        e.preventDefault()

        if (!dragging) {
          setDragging(true)
        }

        const { offsetX: x, offsetY: y } = e
        draggingPosition$.current.x = x
        draggingPosition$.current.y = y

        const container = container$.current
        if (!container) return

        container.style.backgroundPosition = `${x - (x % 50)}px ${
          y - (y % 50)
        }px`
      }}
      onDragLeave={() => {
        setDragging(false)

        const container = container$.current
        if (!container) return

        container.style.backgroundPosition = ""
      }}
      onDrop={() => {
        setDragging(false)

        const { x, y } = draggingPosition$.current
        onDrop?.({
          col: (x - (x % 50)) / 50,
          row: (y - (y % 50)) / 50,
          x,
          y,
        })

        const container = container$.current
        if (!container) return

        container.style.backgroundPosition = ""
      }}
      className={cx(
        css`
          position: relative;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
        `,
        className,
        mode === "debug" &&
          css`
            background-position: top left;
            background-image: repeating-linear-gradient(
                90deg,
                currentColor 0px,
                currentColor 0.5px,
                transparent 0.5px,
                transparent 49.5px,
                currentColor 49.5px,
                currentColor 50px
              ),
              repeating-linear-gradient(
                180deg,
                currentColor 0px,
                currentColor 0.5px,
                transparent 0.5px,
                transparent 49.5px,
                currentColor 49.5px,
                currentColor 50px
              );
          `,
        dragging &&
          css`
            background-repeat: no-repeat;
            background-size: 50px 50px;
            background-image: linear-gradient(currentColor, currentColor);
          `,
      )}
      {...props}
    ></div>
  )
}
