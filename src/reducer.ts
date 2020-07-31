import produce from "https://cdn.skypack.dev/immer"
import { allCards } from "./allCards.js"
import { randomID } from "./util.js"

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

  piles: allCards.reduce((piles, c) => {
    const card: Card = {
      ...c,
      id: randomID() as Card["id"],
      state: Math.random() >= 0.5 ? "face" : "back",
    }

    const col = Math.floor(10 + 20 * Math.random())
    const row = Math.floor(10 + 20 * Math.random())

    const pile = piles.find(p => p.col === col && p.row === row)
    if (pile) {
      pile.cards.push(card)
    } else {
      piles.push({
        id: randomID() as Pile["id"],
        cards: [card],
        col,
        row,
      })
    }

    return piles
  }, [] as State["piles"]),
}

export type Action =
  | {
      type: "Grid.Drop"
      payload: {
        col: number
        row: number
      }
    }
  | {
      type: "Pile.DragStart"
      payload: {
        pileId: Pile["id"]
      }
    }
  | {
      type: "Pile.DragEnd"
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
      type: "Firestore.Update.Pile"
      payload: {
        id: string
        pile: unknown
      }
    }

export const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case "Grid.Drop": {
      const draggingPile = draft.piles.find(p => p.dragging === draft.user.id)
      if (!draggingPile) return

      draggingPile.dragging = undefined

      const { col, row } = action.payload
      draggingPile.col = col
      draggingPile.row = row

      return
    }

    case "Pile.DragStart": {
      const { pileId } = action.payload
      const target = draft.piles.find(p => p.id === pileId)
      if (!target) return

      target.dragging = draft.user.id

      return
    }

    case "Pile.DragEnd": {
      const draggingPile = draft.piles.find(p => p.dragging === draft.user.id)
      if (!draggingPile) return

      draggingPile.dragging = undefined

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

    case "Firestore.Update.Pile": {
      const { id, pile } = action.payload
      if (!isPileData(pile)) return

      const targetIndex = draft.piles.findIndex(p => p.id === id)
      draft.piles[targetIndex] = {
        ...pile,
        id: id as Pile["id"],
      }

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
