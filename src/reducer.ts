import produce from "https://cdn.skypack.dev/immer"
import { byId, randomID } from "./util.js"

export type State = {
  user: User

  game: Game

  piles: Pile[]
  tempCardPosition: {
    [cardId: string]:
      | {
          col: number
          row: number
        }
      | undefined
  }
}

export type User = {
  id: string & { readonly u: unique symbol }
}

export type Game = {
  collection?: string
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
    id: randomID() as User["id"],
  },
  game: {},
  piles: [],
  tempCardPosition: {},
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
      }
    }
  | {
      type: "Card.MoveEnd.Finished"
      payload: {
        cardId: Card["id"]
      }
    }
  | {
      type: "Game.Created"
      payload: {
        collection: string
      }
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
      const { cardId, col, row } = action.payload

      draft.tempCardPosition[cardId] = { col, row }

      return
    }

    case "Card.MoveEnd.Finished": {
      const { cardId } = action.payload

      delete draft.tempCardPosition[cardId]

      return
    }

    case "Game.Created": {
      const { collection } = action.payload

      draft.game = {
        collection,
      }

      draft.piles = []
      draft.tempCardPosition = {}

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
