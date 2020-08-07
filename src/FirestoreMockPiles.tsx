import { useEffect } from "https://cdn.skypack.dev/react"
import { useDispatch } from "https://cdn.skypack.dev/react-redux"
import { allCards } from "./allCards.js"
import type { Card, Pile, State } from "./reducer.js"
import { randomID } from "./util.js"

export function FirestoreMockPiles() {
  const dispatch = useDispatch()

  useEffect(() => {
    const piles = allCards.reduce((piles, c) => {
      const card: Card = {
        ...c,
        id: randomID() as Card["id"],
        surface: Math.random() >= 0.5 ? "face" : "back",
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
    }, [] as State["piles"])

    dispatch({
      type: "Firestore.ChangePiles",
      payload: {
        changes: piles.map(({ id, ...data }) => {
          return {
            type: "added",
            id: id,
            data,
          }
        }),
      },
    })
  }, [dispatch])

  return null
}