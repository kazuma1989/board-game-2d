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

  ui: {
    longTransactionRunning: boolean
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
  ui: {
    longTransactionRunning: false,
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
    }
  | {
      type: "Card.AwaitTransaction.Finished"
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
        const { id: pileId } = change
        delete draft.tempCardPosition[pileId]

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
      draft.ui.longTransactionRunning = true

      return
    }

    case "Card.AwaitTransaction.Finished": {
      draft.ui.longTransactionRunning = false

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
