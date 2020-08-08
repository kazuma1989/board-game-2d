import { randomId, shuffle } from "../util"
import { allCards as _allCards } from "./allCards"

export default function data() {
  const piles: Record<
    string,
    {
      col: number
      row: number
      cards: {
        id: string
        surface: "back" | "face"
        text: string
        src: {
          back: string
          face: string
        }
      }[]
    }
  > = {}

  const allCards = [..._allCards]
  shuffle(allCards)

  const cr$ = colAndRow()
  let r = cr$.next()
  while (!r.done) {
    const [i, { col, row }] = r.value

    const card = allCards[i % allCards.length]
    piles[[col, row].join(",")] = {
      col,
      row,
      cards: [
        {
          ...card,
          id: randomId(),
          surface: "back",
        },
      ],
    }

    r = cr$.next()
  }

  return {
    piles,
  }
}

function* colAndRow() {
  let index = 0
  let col = 13

  while (col <= 25) {
    let row = 16

    while (row <= 23) {
      yield [index, { col, row }] as const

      row += 2
      index += 1
    }

    col += 1
  }
}
