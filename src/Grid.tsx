import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useRef } from "https://cdn.skypack.dev/preact/compat"
import { mode } from "./mode.js"

export function Grid({
  onDrop,
  className,
  style,
  ...props
}: {
  onDrop?(dest: { col: number; row: number; x: number; y: number }): void
  className?: string
  style?: any
}) {
  const indicator$ = useRef<HTMLDivElement>()
  const updateHighlight = (x: number, y: number) => {
    const indicator = indicator$.current
    if (!indicator) return

    indicator.classList.add(highlight)
    indicator.style.backgroundPosition = `${x - (x % 50)}px ${y - (y % 50)}px`
  }
  const finishHighlight = () => {
    const indicator = indicator$.current
    if (!indicator) return

    indicator.classList.remove(highlight)
    indicator.style.backgroundPosition = ""
  }

  const draggingPosition$ = useRef({ x: 0, y: 0 })

  return (
    <div
      onDragOver={e => {
        e.preventDefault()

        const { offsetX: x, offsetY: y } = e
        draggingPosition$.current.x = x
        draggingPosition$.current.y = y

        updateHighlight(x, y)
      }}
      onDragLeave={finishHighlight}
      onDrop={() => {
        finishHighlight()

        const { x, y } = draggingPosition$.current
        onDrop?.({
          col: (x - (x % 50)) / 50,
          row: (y - (y % 50)) / 50,
          x,
          y,
        })
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
      )}
      style={style}
      {...props}
    >
      {mode === "debug" && (
        <div
          className={css`
            width: 100%;
            height: 100%;
            position: absolute;

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
          `}
        ></div>
      )}

      <div
        ref={indicator$}
        className={css`
          width: 100%;
          height: 100%;
          position: absolute;
        `}
      ></div>
    </div>
  )
}

const highlight = css`
  background-repeat: no-repeat;
  background-size: 50px 50px;
  background-image: linear-gradient(currentColor, currentColor);
`
