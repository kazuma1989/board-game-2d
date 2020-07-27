// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.skypack.dev/emotion"
import {
  html,
  useMemo,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js"

export function Pile({
  cards,
  x,
  y,
  className,
  style,
  onDragStart,
  onDragEnd,
  onDrop,
  ...props
}) {
  const [dragging, setDragging] = useState(false)

  const cardElements = useMemo(() => {
    return cards.map(({ text }, i, { length }) => {
      const m = length - (length % 5)
      const n = i - m

      return html`
        <${Card}
          key=${i}
          text=${text}
          className=${css`
            position: absolute;
          `}
          style=${n >= 0
            ? m === 0
              ? {
                  left: -3 * n,
                  top: -2 * n,
                }
              : {
                  left: -3 * (n + 1) - 1 * m,
                  top: -2 * (n + 1) - 0.5 * m,
                }
            : {
                left: -1 * i,
                top: -0.5 * i,
              }}
        />
      `
    })
  }, [cards])

  return html`
    <div
      draggable
      onDragStart=${() => {
        setDragging(true)
        onDragStart?.()
      }}
      onDragEnd=${() => {
        setDragging(false)
        onDragEnd?.()
      }}
      onDragOver=${e => {
        e.preventDefault()
      }}
      onDrop=${() => {
        onDrop?.()
      }}
      className=${cx(
        css`
          position: absolute;
        `,
        dragging &&
          css`
            opacity: 0.5;
          `,
        className,
      )}
      style=${{
        left: x,
        top: y,
        ...style,
      }}
      ...${props}
    >
      ${cardElements}
    </div>
  `
}

function Card({ text, className, ...props }) {
  return html`
    <div
      className=${cx(
        css`
          border: solid 1px gray;
          width: 50px;
          height: 70px;
          box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.4);
          background-color: white;
          cursor: move;
        `,
        className,
      )}
      ...${props}
    >
      ${text}
    </div>
  `
}