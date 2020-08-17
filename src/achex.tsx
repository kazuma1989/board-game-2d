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
  const userId = useSelector(state => state.user.id)

  const achex = useMemo(
    () =>
      new Achex("wss://cloud.achex.ca/board-game-2d.web.app", gameId, userId),
    // () => new Achex("wss://localhost", gameId, userId),
    [gameId, userId],
  )

  useEffect(() => {
    return () => {
      achex.close()
    }
  }, [achex])

  return <context.Provider value={achex}>{children}</context.Provider>
}

export function useAchex() {
  const achex = useContext(context)
  if (!achex) {
    throw new Error("Not in the context of a Achex provider")
  }

  return achex
}

const context = createContext<Achex | null>(null)

type AchexMessageReq<A = unknown> =
  | {
      auth: string
      passwd?: string
    }
  | {
      joinHub: string
    }
  | {
      leaveHub: string
    }
  | {
      toH: string
      action?: A
    }

type AchexMessageResp<A = unknown> =
  | {
      auth: string
      SID: number
    }
  | {
      joinHub: string
    }
  | {
      leaveHub: string
    }
  | {
      leftHub: string
      user: string
      sID: number
    }
  | {
      toH: string
      FROM: string
      sID: number
      action?: A
    }

class Achex {
  private readonly ws: WebSocket

  constructor(
    private readonly url: string,
    private readonly gameId: string,
    private readonly userId: string,
  ) {
    this.ws = new WebSocket(url)

    this.ws.addEventListener(
      "open",
      () => {
        this.send({ auth: userId })
        this.send({ joinHub: gameId })
      },
      { passive: true },
    )
  }

  dispatch(action: unknown) {
    this.send({
      toH: this.gameId,
      action,
    })
  }

  on<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (...args: ListenerParameterMap[K]) => void,
  ) {
    let _listener
    this.ws.addEventListener(
      type,
      (_listener = (e: WebSocketEventMap[K]) => {
        if (type === "message") {
          // 面倒なので無理やり通す
          // @ts-expect-error
          listener(JSON.parse(e.data))
        }
      }),
      { passive: true },
    )

    return () => {
      this.ws.removeEventListener(type, _listener)
    }
  }

  send(data: AchexMessageReq) {
    if (this.ws.readyState !== WebSocket.OPEN) return

    this.ws.send(JSON.stringify(data))
  }

  close() {
    this.send({
      leaveHub: this.gameId,
    })

    this.ws.close()
  }
}

type ListenerParameterMap = {
  close: []
  error: []
  message: [AchexMessageResp]
  open: []
}
