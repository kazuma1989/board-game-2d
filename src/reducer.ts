import produce from "https://cdn.skypack.dev/immer"
import { byId, randomID } from "./util.js"

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

export type Action = {
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

    // default: {
    //   const _: never = action
    // }
  }
}, initialState)

function isPileData(obj: any): obj is Omit<Pile, "id"> {
  if (!obj.cards) {
    return false
  }

  // TODO ちゃんとした実装
  return true
}
