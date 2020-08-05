import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/react"
import type { CSSProperties } from "react"
import { useScale } from "./useScale.js"

export function Card({
  col,
  row,
  index,
  length,
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
  length: number
  locked?: boolean

  text?: string
  src?: {
    face: string
    back: string
  }

  onMoveStart?(): void
  onMoveEnd?(dest: { col: number; row: number; x: number; y: number }): void

  className?: string
  style?: CSSProperties
}) {
  const scale$ = useScale()

  const [state, setState] = useState<keyof Exclude<typeof src, undefined>>(
    "back",
  )
  useEffect(() => {
    setState(Math.random() >= 0.5 ? "face" : "back")
  }, [])

  const [grabbing, setGrabbing] = useState(false)
  const locked$ = useRef(locked)
  useEffect(() => {
    locked$.current = locked
  })

  let ratio: number
  if (length <= 0) {
    ratio = 0
  } else if (index <= 0) {
    ratio = 0
  } else if (index >= length) {
    ratio = 0
  } else {
    ratio = 1 / (length / index - 1) / length
  }

  const left = -6 * ratio
  const top = ratio / 2

  return (
    <div
      onDoubleClick={e => {
        console.debug(e.type, "in React")
        setState("face")
      }}
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

        let pointermove
        target.addEventListener(
          "pointermove",
          (pointermove = (e: PointerEvent) => {
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
          transform: translate(${col * 50}px, ${row * 50}px)
            translate(${left}px, ${top}px);
          position: absolute;
          transform-style: preserve-3d;

          ::after,
          ::before {
            transition: transform 200ms;
            position: absolute;
            width: 50px;
            height: 76.5px;
            border-radius: 4px;
            box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.4);
            backface-visibility: hidden;
            background-size: cover;
            background-repeat: no-repeat;
          }

          ::after {
            content: ${JSON.stringify(text)};
            background-image: url(${JSON.stringify(src?.face)});
          }

          ::before {
            content: "";
            background-image: url(${JSON.stringify(src?.back)});
          }
        `,
        state === "back"
          ? css`
              ::after {
                transform: rotateY(180deg);
              }
              ::before {
                transform: rotateY(0deg);
              }
            `
          : css`
              ::after {
                transform: rotateY(0deg);
              }
              ::before {
                transform: rotateY(180deg);
              }
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
    ></div>
  )
}
