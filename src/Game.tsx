import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useEffect } from "https://cdn.skypack.dev/react"
import { useDispatch, useSelector } from "https://cdn.skypack.dev/react-redux"
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
