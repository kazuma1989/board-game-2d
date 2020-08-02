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
      type: "Firestore.Insert.Pile"
      payload: {
        id: string
        pile: unknown
      }
    }
  | {
      type: "Firestore.Update.Pile"
      payload: {
        id: string
        pile: unknown
      }
    }
  | {
      type: "Firestore.Delete.Pile"
      payload: {
        id: string
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
      if (target) {
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

    case "Firestore.Insert.Pile": {
      const { id, pile } = action.payload
      if (!isPileData(pile)) return

      draft.piles.push({
        ...pile,
        id: id as Pile["id"],
      })

      return
    }

    case "Firestore.Update.Pile": {
      const { id, pile } = action.payload
      if (!isPileData(pile)) return

      const target = draft.piles.find(byId(id))
      if (!target) return

      draft.piles[draft.piles.indexOf(target)] = {
        ...pile,
        id: id as Pile["id"],
      }

      return
    }

    case "Firestore.Delete.Pile": {
      const { id } = action.payload

      const target = draft.piles.find(byId(id))
      if (!target) return

      draft.piles.splice(draft.piles.indexOf(target), 1)

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
