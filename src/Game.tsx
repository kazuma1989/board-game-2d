import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"
import { useDispatch, useSelector } from "https://cdn.skypack.dev/react-redux"
import { Provider as AchexProvider, useAchex } from "./achex.js"
import { Board } from "./Board.js"
import { FirestorePiles } from "./FirestorePiles.js"
import { Header } from "./Header.js"
import { Provider as PilesProvider } from "./piles.js"
import type { Game } from "./reducer"

export function Game({ id: gameId }: { id: Game["id"] }) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({
      type: "Game.IdSet",
      payload: {
        gameId,
      },
    })

    return () => {
      dispatch({
        type: "Game.IdUnset",
      })
    }
  }, [gameId])

  return (
    <PilesProvider gameId={gameId}>
      <FirestorePiles />

      <Container>
        <Header />

        <Board />

        <AchexProvider gameId={gameId}>
          <ActiveIndicatorContainer />
        </AchexProvider>
      </Container>
    </PilesProvider>
  )
}

function Container({ children }: { children?: React.ReactNode }) {
  const running = useSelector(
    state => state.ui.runningLongTransaction.length >= 1,
  )

  return (
    <div
      className={cx(
        css`
          display: contents;
          touch-action: none;
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        `,
        running &&
          css`
            cursor: progress;
          `,
      )}
    >
      {children}
    </div>
  )
}

function ActiveIndicatorContainer() {
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
            border: solid 4px hsl(${((sID % 12) * 150) % 360}, 100%, 50%);
            border-radius: 50%;
            transition: transform 400ms;
          `

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

        const { clientX, clientY } = e
        const send = () => {
          achex.dispatch({
            type: "move",
            payload: {
              x: clientX,
              y: clientY,
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
