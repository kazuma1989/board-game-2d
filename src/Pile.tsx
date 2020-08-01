import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, {
  CSSProperties,
  useMemo,
  useState,
} from "https://cdn.skypack.dev/react"
import type { Card } from "./reducer"
import { useScale } from "./useScale.js"

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
  const scale$ = useScale()

  // cards に変化ないのに位置計算を毎回するのは無駄と考えて memoize した
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

            onDragEnd?.()
          },
          { once: true, passive: true },
        )

        onDragStart?.()
      }}
      className={cx(
        css`
          transform: translate(${col * 50}px, ${row * 50}px);
        `,
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
      style={style}
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
