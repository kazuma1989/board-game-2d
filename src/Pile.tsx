import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
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

  const screen$ = useRef({ x: -1, y: -1 })
  const translate$ = useRef({ x: col * 50, y: row * 50 })
  useEffect(() => {
    translate$.current = { x: col * 50, y: row * 50 }
  })

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
      onPointerDown={e => {
        if (!e.isPrimary) return

        setDragging(true)

        screen$.current.x = e.screenX
        screen$.current.y = e.screenY

        if (e.pointerType === "mouse") {
          e.currentTarget.setPointerCapture(e.pointerId)
        }

        onDragStart?.()
      }}
      onPointerMove={e => {
        if (!e.isPrimary) return
        if (!dragging) return

        if (screen$.current.x === -1) {
          screen$.current.x = e.screenX
        }
        if (screen$.current.y === -1) {
          screen$.current.y = e.screenY
        }

        const movementX = e.screenX - screen$.current.x
        const movementY = e.screenY - screen$.current.y

        translate$.current.x += movementX
        translate$.current.y += movementY

        screen$.current.x = e.screenX
        screen$.current.y = e.screenY

        e.currentTarget.style.transform = `translate(${translate$.current.x}px, ${translate$.current.y}px)`
      }}
      onPointerUp={e => {
        if (!e.isPrimary) return

        setDragging(false)

        translate$.current = { x: col * 50, y: row * 50 }
        e.currentTarget.style.transform = `translate(${translate$.current.x}px, ${translate$.current.y}px)`

        if (e.pointerType === "mouse") {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }

        onDragEnd?.()
      }}
      className={cx(
        css`
          position: absolute;
          left: 0;
          top: 0;
          cursor: grab;
        `,
        dragging &&
          css`
            z-index: 100;
            cursor: grabbing;
          `,
        className,
      )}
      style={{
        transform: `translate(${translate$.current.x}px, ${translate$.current.y}px)`,
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
