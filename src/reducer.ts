import produce from "https://cdn.skypack.dev/immer"
import { byCR, byId, randomID } from "./util.js"

export type State = {
  user: User
  piles: Pile[]
}

export type User = {
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
  state: "face" | "back"
}

const initialState: State = {
  user: {
    id: randomID() as User["id"],
  },
  piles: [],
}

export type Action =
  | {
      type: "Pile.DragStart"
      payload: {
        pileId: Pile["id"]
      }
    }
  | {
      type: "Pile.DragStart.Success"
      payload: {
        pileId: Pile["id"]
      }
    }
  | {
      type: "Pile.DragStart.Failed"
      payload: {
        pileId: Pile["id"]
      }
    }
  | {
      type: "Pile.DragEnd"
      payload: {
        pileId: Pile["id"]
        col: number
        row: number
      }
    }
  | {
      type: "Pile.DragEnter"
      payload: {
        pileId: Pile["id"]
      }
    }
  | {
      type: "Pile.Drop"
      payload: {
        pileId: Pile["id"]
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

export const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case "Pile.DragStart": {
      const { pileId } = action.payload

      const target = draft.piles.find(byId(pileId))
      if (!target) return

      return
    }

    case "Pile.DragStart.Success": {
      const { pileId } = action.payload

      const target = draft.piles.find(byId(pileId))
      if (!target) return

      return
    }

    case "Pile.DragStart.Failed": {
      const { pileId } = action.payload

      const target = draft.piles.find(byId(pileId))
      if (!target) return

      return
    }

    case "Pile.DragEnd": {
      const { pileId, col, row } = action.payload

      const pile = draft.piles.find(byId(pileId))
      if (!pile) return

      const target = draft.piles.find(byCR(col, row))
      if (target && target.id !== pileId) {
        draft.piles.splice(draft.piles.indexOf(pile), 1)

        target.cards.push(...pile.cards)
      } else {
        pile.col = col
        pile.row = row
      }

      return
    }

    case "Pile.DragEnter": {
      const draggingPile = draft.piles.find(p => p.dragging === draft.user.id)
      if (!draggingPile) return

      // 掴みっぱなし
      // draggingPile.dragging = undefined

      const { pileId } = action.payload
      const target = draft.piles.find(p => p.id === pileId)
      if (!target) return

      draft.piles.splice(draft.piles.indexOf(target), 1)

      draggingPile.cards.unshift(...target.cards)

      return
    }

    case "Pile.Drop": {
      const draggingPile = draft.piles.find(p => p.dragging === draft.user.id)
      if (!draggingPile) return

      draggingPile.dragging = undefined

      const { pileId } = action.payload
      const target = draft.piles.find(p => p.id === pileId)
      if (!target) return

      draft.piles.splice(draft.piles.indexOf(draggingPile), 1)

      target.cards.push(...draggingPile.cards)

      return
    }

    case "Card.MoveEnd": {
      const { cardId, col, row } = action.payload

      const fromPile = draft.piles.find(p => p.cards.some(c => c.id === cardId))
      if (!fromPile) return

      const toPile = draft.piles.find(byCR(col, row))
      if (toPile) {
        if (toPile.id === fromPile.id) {
          // pile から card を取り上げたが同じ pile に戻した
        } else {
          // pile 内の card を別の pile に移した

          const card = fromPile.cards.find(byId(cardId))
          if (!card) return

          const fromCards = fromPile.cards.filter(byId.not(cardId))
          if (fromCards.length) {
            fromPile.cards = fromCards
          } else {
            draft.piles.splice(draft.piles.indexOf(fromPile), 1)
          }

          toPile.cards.push(card)
        }
      } else {
        // fromPile.col = col
        // fromPile.row = row
      }

      return
    }

    case "Firestore.ChangePiles": {
      const { changes } = action.payload

      changes.forEach(change => {
        switch (change.type) {
          case "added":
          case "modified": {
            const { id, data } = change
            if (!isPileData(data)) return

            const pile = {
              ...data,
              id: id as Pile["id"],
            }

            const target = draft.piles.find(byId(id))
            if (target) {
              draft.piles[draft.piles.indexOf(target)] = pile
            } else {
              draft.piles.push(pile)
            }

            return
          }

          case "removed": {
            const { id } = change

            const target = draft.piles.find(byId(id))
            if (!target) return

            draft.piles.splice(draft.piles.indexOf(target), 1)

            return
          }
        }
      })

      return
    }

    default: {
      const _: never = action
    }
  }
}, initialState)

function isPileData(obj: unknown): obj is Omit<Pile, "id"> {
  // TODO ちゃんとした実装
  return true
}
