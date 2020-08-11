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
    [cardId: string]: "back" | "face" | undefined
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
      }
    }
  | {
      type: "Card.DoubleTap.Finished"
      payload: {
        cardId: Card["id"]
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

              target.cards.forEach(c => {
                delete draft.tempCardPosition[c.id]
                delete draft.tempCardSurface[c.id]
              })
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

            target.cards.forEach(c => {
              delete draft.tempCardPosition[c.id]
              delete draft.tempCardSurface[c.id]
            })

            return
          }
        }
      })

      return
    }

    case "Card.DoubleTap": {
      const { cardId } = action.payload

      const card = draft.piles.flatMap(p => p.cards).find(byId(cardId))
      if (!card) return

      switch (card.surface) {
        case "back": {
          draft.tempCardSurface[cardId] = "face"
          return
        }

        case "face": {
          draft.tempCardSurface[cardId] = "back"
          return
        }

        default: {
          const _: never = card.surface
          return
        }
      }
    }

    case "Card.DoubleTap.Finished": {
      const { cardId } = action.payload

      delete draft.tempCardSurface[cardId]

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
