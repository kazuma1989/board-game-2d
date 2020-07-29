import produce from "https://cdn.skypack.dev/immer"
import { allCards } from "./allCards.js"
import { randomID } from "./util.js"

export type State = {
  piles: (Pile | null)[][]
  draggingPile: {
    col: number
    row: number
  }
}

export type Pile = {
  id: string & { readonly u: unique symbol }
  cards: Card[]
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
  piles: [...Array(40)].map(() =>
    [...Array(40)].map(() => {
      if (Math.random() <= 0.95) {
        return null
      }

      const i = Math.floor(Math.random() * allCards.length)
      const card = allCards[i]

      const pile: Pile = {
        id: randomID() as Pile["id"],
        cards: [
          {
            ...card,
            id: randomID() as Card["id"],
            state: Math.random() >= 0.5 ? "face" : "back",
          },
        ],
      }

      return pile
    }),
  ),
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

      if (row === -1 || col === -1) return
      if (row === dest.row && col === dest.col) return

      draft.piles[dest.row][dest.col] = draft.piles[row][col]
      draft.piles[row][col] = null

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

      if (row === -1 || col === -1) return
      if (row === dest.row && col === dest.col) return

      draft.piles[row][col]?.cards.unshift(
        ...(draft.piles[dest.row][dest.col]?.cards ?? []),
      )
      draft.piles[dest.row][dest.col] = null

      return
    }

    case "Pile.Drop": {
      const dest = action.payload
      const { col, row } = draft.draggingPile

      if (row === -1 || col === -1) return
      if (row === dest.row && col === dest.col) return

      draft.piles[dest.row][dest.col]?.cards.push(
        ...(draft.piles[row][col]?.cards ?? []),
      )
      draft.piles[row][col] = null

      draft.draggingPile = { col: -1, row: -1 }

      return
    }

    default: {
      const _: never = action
    }
  }
}, initialState)
