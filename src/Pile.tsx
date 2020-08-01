import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, {
  CSSProperties,
  useMemo,
  useState,
} from "https://cdn.skypack.dev/react"
import type { Card } from "./reducer"

export function Pile({
  cards,
  col,
  row,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  className,
  style,
  ...props
}: {
  cards: {
    id: Card["id"]
    text: string
    src: {
      face: string
      back: string
    }
    state: "face" | "back"
  }[]
  col: number
  row: number
  onDragStart?(): void
  onDragEnd?(): void
  onDragEnter?(): void
  onDrop?(): void
  className?: string
  style?: CSSProperties
}) {
  const [dragging, setDragging] = useState(false)

  const cardElements = useMemo(() => {
    return cards.map(({ id, text, src, state }, i, { length }) => {
      const m = length - (length % 5)
      const n = i - m

      // 読みづらいがいったんうまくいってるのでノータッチ
      const { left, top } =
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

      return (
        <CardComp
          key={id}
          text={text}
          src={src[state]}
          className={css`
            position: absolute;
          `}
          style={{
            transform: `translate(${left}px, ${top}px)`,
          }}
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
          left: 0;
          top: 0;
        `,
        dragging &&
          css`
            opacity: 0.5;
          `,
        className,
      )}
      style={{
        transform: `translate(${col * 50}px, ${row * 50}px)`,
        ...style,
      }}
      {...props}
    >
      {cardElements}
    </div>
  )
}

function CardComp({
  text,
  src,
  className,
  style,
  ...props
}: {
  text?: string
  src?: string
  className?: string
  style?: any
}) {
  return (
    <div
      className={cx(
        css`
          border: solid 1px gray;
          width: 50px;
          height: 76px;
          box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.4);
          background-color: white;
          cursor: grab;

          :active {
            cursor: grabbing;
          }
        `,
        src &&
          css`
            background-image: url(${src});
            background-size: cover;
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
