import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useMemo, useState } from "https://cdn.skypack.dev/preact/compat"

export function Pile({
  cards,
  x,
  y,
  className,
  style,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  ...props
}: {
  cards: any[]
  x: number
  y: number
  onDragStart?(): void
  onDragEnd?(): void
  onDragEnter?(): void
  onDrop?(): void
  className?: string
  style?: any
}) {
  const [dragging, setDragging] = useState(false)

  const cardElements = useMemo(() => {
    return cards.map(({ text }, i, { length }) => {
      const m = length - (length % 5)
      const n = i - m

      return (
        <Card
          key={i}
          text={text}
          className={css`
            position: absolute;
          `}
          style={
            n >= 0
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
                }
          }
        />
      )
    })
  }, [cards])

  return (
    <div
      draggable
      onDragStart={e => {
        setDragging(true)

        // ドラッグで掴んでいる位置と、Pile がドロップで配置される位置をなるべく近づける
        const cardOnTop = e.currentTarget.lastElementChild
        if (cardOnTop instanceof HTMLElement) {
          const left = parseFloat(cardOnTop.style.left) || 0
          const top = parseFloat(cardOnTop.style.top) || 0

          e.dataTransfer?.setDragImage(e.currentTarget, -left + 25, -top + 25)
        }

        onDragStart?.()
      }}
      onDragEnd={() => {
        setDragging(false)

        onDragEnd?.()
      }}
      onDragOver={e => {
        e.preventDefault()
      }}
      onDragEnter={e => {
        if (!e.shiftKey) return

        onDragEnter?.()
      }}
      onDrop={() => {
        onDrop?.()
      }}
      className={cx(
        css`
          position: absolute;
        `,
        dragging &&
          css`
            opacity: 0.5;
          `,
        className,
      )}
      style={{
        left: x,
        top: y,
        ...style,
      }}
      {...props}
    >
      {cardElements}
    </div>
  )
}

function Card({ text, className, ...props }) {
  return (
    <div
      className={cx(
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
      {...props}
    >
      {text}
    </div>
  )
}
