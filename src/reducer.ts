import produce from "https://cdn.skypack.dev/immer"
import { allCards } from "./allCards.js"
import { randomID } from "./util.js"

export type State = {
  // userId: string & { readonly u: unique symbol }

  piles: Pile[]

  // TODO draggingPile やめて Pile に dragger の ID 持たせたい
  draggingPile: {
    col: number
    row: number
  }
}

export type Pile = {
  id: string & { readonly u: unique symbol }
  cards: Card[]
  col: number
  row: number
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
  // userId: randomID() as State["userId"],

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

  draggingPile: {
    col: -1,
    row: -1,
  },
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
        col: number
        row: number
      }
    }
  | {
      type: "Pile.DragEnd"
    }
  | {
      type: "Pile.DragEnter"
      payload: {
        col: number
        row: number
      }
    }
  | {
      type: "Pile.Drop"
      payload: {
        col: number
        row: number
      }
    }

export const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case "Grid.Drop": {
      const dest = action.payload
      const { col, row } = draft.draggingPile

      draft.draggingPile = { col: -1, row: -1 }

      if (row === dest.row && col === dest.col) return

      const target = draft.piles.find(at(col, row))
      if (target) {
        target.col = dest.col
        target.row = dest.row
      }

      return
    }

    case "Pile.DragStart": {
      const { col, row } = action.payload

      draft.draggingPile = { col, row }

      return
    }

    case "Pile.DragEnd": {
      draft.draggingPile = { col: -1, row: -1 }

      return
    }

    case "Pile.DragEnter": {
      const dest = action.payload
      const { col, row } = draft.draggingPile

      if (row === dest.row && col === dest.col) return

      const index = draft.piles.findIndex(at(dest.col, dest.row))
      const from = draft.piles[index]
      const to = draft.piles.find(at(col, row))
      if (from && to) {
        draft.piles.splice(index, 1)

        to.cards.unshift(...from.cards)
      }

      return
    }

    case "Pile.Drop": {
      const dest = action.payload
      const { col, row } = draft.draggingPile

      draft.draggingPile = { col: -1, row: -1 }

      if (row === dest.row && col === dest.col) return

      const index = draft.piles.findIndex(at(col, row))
      const from = draft.piles[index]
      const to = draft.piles.find(at(dest.col, dest.row))
      if (from && to) {
        draft.piles.splice(index, 1)

        to.cards.push(...from.cards)
      }

      return
    }

    default: {
      const _: never = action
    }
  }
}, initialState)

function at(
  col: number,
  row: number,
): (p: { col: number; row: number }) => boolean {
  return p => p.col === col && p.row === row
}
