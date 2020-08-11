import produce from "https://cdn.skypack.dev/immer"
import { byId, randomId } from "./util.js"

export type State = {
  user: User

  game?: Game

  piles: Pile[]
  tempCardPosition: {
    [cardId: string]:
      | {
          col: number
          row: number
          timestamp: number
        }
      | undefined
  }
  tempCardSurface: {
    [cardId: string]:
      | {
          surface: "back" | "face" | undefined
          timestamp: number
        }
      | undefined
  }

  ui: {
    runningLongTransaction: number[]
  }
}

export type User = {
  id: string & { readonly u: unique symbol }
}

export type Game = {
  id: string & { readonly u: unique symbol }
}

export type Pile = {
  id: string & { readonly u: unique symbol }
  cards: Card[]
  col: number
  row: number
  dragging?: User["id"]
}

export type Card = {
  id: string & { readonly u: unique symbol }
  text: string
  src: {
    face: string
    back: string
  }
  surface: "face" | "back"
}

const initialState: State = {
  user: {
    id: randomId() as User["id"],
  },
  piles: [],
  tempCardPosition: {},
  tempCardSurface: {},
  ui: {
    runningLongTransaction: [],
  },
}

export type Action =
  | {
      type: "Firestore.ChangePiles"
      payload: {
        changes: (
          | {
              type: "added" | "modified"
              id: string
              data: unknown
            }
          | {
              type: "removed"
              id: string
            }
        )[]
      }
    }
  | {
      type: "Card.DoubleTap"
      payload: {
        cardId: Card["id"]
        nextSurface: "back" | "face"
        timestamp: number
      }
    }
  | {
      type: "Card.DoubleTap.Finished"
      payload: {
        cardId: Card["id"]
        timestamp: number
      }
    }
  | {
      type: "Card.MoveEnd"
      payload: {
        cardId: Card["id"]
        col: number
        row: number
        timestamp: number
      }
    }
  | {
      type: "Card.MoveEnd.Finished"
      payload: {
        cardId: Card["id"]
        timestamp: number
      }
    }
  | {
      type: "Card.AwaitTransaction"
      payload: {
        timestamp: number
      }
    }
  | {
      type: "Card.AwaitTransaction.Finished"
      payload: {
        timestamp: number
      }
    }
  | {
      type: "Card.ClearTempInfo"
      payload: {
        timestamp: number
      }
    }
  | {
      type: "Game.IdSet"
      payload: {
        gameId: Game["id"]
      }
    }
  | {
      type: "Game.IdUnset"
    }

export const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case "Firestore.ChangePiles": {
      const { changes } = action.payload

      changes.forEach(change => {
        switch (change.type) {
          case "added":
          case "modified": {
            const { id: pileId, data } = change
            if (!isPileData(data)) return

            const pile = {
              ...data,
              id: pileId as Pile["id"],
            }

            const target = draft.piles.find(byId(pileId))
            if (target) {
              draft.piles[draft.piles.indexOf(target)] = pile
            } else {
              draft.piles.push(pile)
            }

            return
          }

          case "removed": {
            const { id: pileId } = change

            const target = draft.piles.find(byId(pileId))
            if (!target) return

            draft.piles.splice(draft.piles.indexOf(target), 1)

            return
          }
        }
      })

      return
    }

    case "Card.DoubleTap": {
      const { cardId, nextSurface, timestamp } = action.payload

      if (draft.tempCardSurface[cardId]?.timestamp ?? -1 <= timestamp) {
        draft.tempCardSurface[cardId] = {
          surface: nextSurface,
          timestamp,
        }
      }

      return
    }

    case "Card.DoubleTap.Finished": {
      const { cardId, timestamp } = action.payload

      if (draft.tempCardSurface[cardId]?.timestamp === timestamp) {
        delete draft.tempCardSurface[cardId]
      }

      return
    }

    case "Card.MoveEnd": {
      const { cardId, col, row, timestamp } = action.payload

      if (draft.tempCardPosition[cardId]?.timestamp ?? -1 <= timestamp) {
        draft.tempCardPosition[cardId] = { col, row, timestamp }
      }

      return
    }

    case "Card.MoveEnd.Finished": {
      const { cardId, timestamp } = action.payload

      if (draft.tempCardPosition[cardId]?.timestamp === timestamp) {
        delete draft.tempCardPosition[cardId]
      }

      return
    }

    case "Game.IdSet": {
      const { gameId } = action.payload

      draft.game = {
        id: gameId,
      }

      return
    }

    case "Game.IdUnset": {
      draft.game = undefined
      draft.piles = []
      draft.tempCardPosition = {}

      return
    }

    case "Card.AwaitTransaction": {
      const { timestamp } = action.payload

      draft.ui.runningLongTransaction.push(timestamp)

      return
    }

    case "Card.AwaitTransaction.Finished": {
      const { timestamp } = action.payload

      draft.ui.runningLongTransaction = draft.ui.runningLongTransaction.filter(
        v => v !== timestamp,
      )

      return
    }

    case "Card.ClearTempInfo": {
      const { timestamp } = action.payload

      Object.entries(draft.tempCardPosition).forEach(([cardId, temp]) => {
        if (!temp) return

        if (temp.timestamp <= timestamp) {
          delete draft.tempCardPosition[cardId]
        }
      })

      Object.entries(draft.tempCardSurface).forEach(([cardId, temp]) => {
        if (!temp) return

        if (temp.timestamp <= timestamp) {
          delete draft.tempCardSurface[cardId]
        }
      })

      return
    }

    default: {
      const _: never = action
    }
  }
}, initialState)

function isPileData(obj: any): obj is Omit<Pile, "id"> {
  if (!obj.cards) {
    return false
  }

  // TODO ちゃんとした実装
  return true
}
