import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/react"
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
  const scale$ = useScale()

  const [grabbing, setGrabbing] = useState(false)
  const locked$ = useRef(locked)
  useEffect(() => {
    locked$.current = locked
  })

  const { left, top } = {
    left: -3 * index,
    top: -2 * index,
  }

  return (
    <div
      onPointerDown={e => {
        if (!e.isPrimary) return
        if (locked || locked$.current) return
        if (grabbing) return

        setGrabbing(true)

        const { currentTarget: target, pointerType, pointerId } = e

        if (pointerType === "mouse") {
          target.setPointerCapture(pointerId)
        }

        let { clientX, clientY } = e
        let translateX = col * 50
        let translateY = row * 50

        let pointermove: (e: PointerEvent) => void
        target.addEventListener(
          "pointermove",
          (pointermove = e => {
            translateX += (e.clientX - clientX) / scale$.current
            translateY += (e.clientY - clientY) / scale$.current

            clientX = e.clientX
            clientY = e.clientY

            if (locked$.current) {
              target.style.transform = ""
            } else {
              target.style.transform = `translate(${translateX}px, ${translateY}px)`
            }
          }),
          { passive: true },
        )

        target.addEventListener(
          "pointerup",
          () => {
            target.style.transform = ""
            target.removeEventListener("pointermove", pointermove)

            setGrabbing(false)

            if (pointerType === "mouse") {
              target.releasePointerCapture(pointerId)
            }

            const centerX = translateX + 25
            const centerY = translateY + 25
            onMoveEnd?.({
              col: (centerX - (centerX % 50)) / 50,
              row: (centerY - (centerY % 50)) / 50,
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
          z-index: ${index};
          transform: translate(${col * 50}px, ${row * 50}px);
          position: absolute;
        `,
        locked
          ? css`
              cursor: not-allowed;
            `
          : css`
              cursor: grab;
            `,
        grabbing && !locked
          ? css`
              z-index: 100;
              cursor: grabbing;
            `
          : css`
              transition: transform 400ms;
            `,
        className,
      )}
      style={style}
      {...props}
    >
      <div
        className={cx(
          css`
            transition: transform 400ms;
            transform: translate(${left}px, ${top}px);
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
        )}
      >
        {text}
      </div>
    </div>
  )
}
