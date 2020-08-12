import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
} from "https://cdn.skypack.dev/react"
import { useSelector } from "https://cdn.skypack.dev/react-redux"

export function Provider({
  gameId,
  children,
}: {
  gameId: string
  children?: React.ReactNode
}) {
  const ws = useMemo(
    () => new WebSocket("wss://cloud.achex.ca/board-game-2d.web.app"),
    [],
  )

  const userId = useSelector(state => state.user.id)

  useEffect(() => {
    ws.addEventListener(
      "open",
      () => {
        ws.send(
          JSON.stringify({
            auth: userId,
          }),
        )

        ws.send(
          JSON.stringify({
            joinHub: gameId,
          }),
        )
      },
      { passive: true, once: true },
    )

    return () => {
      ws.send(
        JSON.stringify({
          leaveHub: gameId,
        }),
      )

      ws.close()
    }
  }, [ws, userId, gameId])

  return <context.Provider value={ws}>{children}</context.Provider>
}

export function useWs() {
  const ws = useContext(context)
  if (!ws) {
    throw new Error("Not in the context of a ws provider")
  }

  return ws
}

const context = createContext<WebSocket | null>(null)
