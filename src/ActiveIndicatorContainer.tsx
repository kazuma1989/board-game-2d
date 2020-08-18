import { css } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"
import { useAchex } from "./achex.js"
import { useScale } from "./Panzoom.js"

export function ActiveIndicatorContainer() {
  const scale$ = useScale()
  const achex = useAchex()

  const container$ = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const indicators: {
      [sid: number]: HTMLElement | undefined
    } = {}

    return achex.on("message", data => {
      if ("auth" in data) {
        return
      }

      if ("joinHub" in data) {
        return
      }

      if ("leaveHub" in data) {
        return
      }

      if ("leftHub" in data) {
        const { sID } = data

        const indicator = indicators[sID]
        if (!indicator) return

        indicator.parentNode?.removeChild(indicator)

        delete indicators[sID]

        return
      }

      if ("toH" in data) {
        const { sID } = data
        const action = data.action as {
          type: "move"
          payload: {
            x: number
            y: number
          }
        }

        if (!indicators[sID]) {
          const indicator = document.createElement("div")
          indicators[sID] = indicator

          indicator.dataset.sid = sID.toString()
          indicator.className = css`
            position: absolute;
            width: 50px;
            height: 50px;
            margin-top: -25px;
            margin-left: -25px;
            border: solid 4px transparent;
            border-radius: 50%;
            transition: transform 400ms;
          `
          indicator.style.borderColor = `hsl(${
            ((sID % 12) * 150) % 360
          }, 100%, 50%)`

          container$.current?.appendChild(indicator)
        }

        switch (action.type) {
          case "move": {
            const indicator = indicators[sID]
            if (!indicator) return

            const { x, y } = action.payload
            indicator.style.transform = `translate(${x}px, ${y}px)`

            return
          }
        }

        return
      }
    })
  }, [achex])

  useEffect(() => {
    let timer
    let prevTime = Date.now()

    let pointermove
    document.addEventListener(
      "pointermove",
      (pointermove = (e: PointerEvent) => {
        if (!e.isPrimary) return

        const container = container$.current
        if (!container) return

        const { x, y } = container.getBoundingClientRect()
        const { clientX, clientY } = e

        const send = () => {
          achex.dispatch({
            type: "move",
            payload: {
              x: (clientX - x) / scale$.current,
              y: (clientY - y) / scale$.current,
            },
          })
        }

        clearTimeout(timer)
        timer = setTimeout(send, 400)

        const currentTime = Date.now()
        if (currentTime - prevTime < 400) return

        prevTime = currentTime
        send()
      }),
      { passive: true },
    )

    return () => {
      document.removeEventListener("pointermove", pointermove)
    }
  }, [achex])

  return (
    <div
      ref={container$}
      className={css`
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
      `}
    ></div>
  )
}
