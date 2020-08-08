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

  const redCards = allCards.filter(c => c.src.face.match(/face_(D|H)_/))
  {
    const cr$ = colAndRowRed()
    let r = cr$.next()
    while (!r.done) {
      const [i, { col, row }] = r.value

      const card = redCards[i % redCards.length]
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
  }

  const blackCards = allCards.filter(c => c.src.face.match(/face_(C|S)_/))
  {
    const cr$ = colAndRowBlack()
    let r = cr$.next()
    while (!r.done) {
      const [i, { col, row }] = r.value

      const card = blackCards[i % blackCards.length]
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
  }

  return {
    piles,
  }
}

function* colAndRowRed() {
  let index = 0
  let col = 13

  while (col <= 25) {
    yield [index, { col, row: 14 }] as const
    index += 1

    yield [index, { col, row: 16 }] as const
    index += 1

    col += 1
  }
}

function* colAndRowBlack() {
  let index = 0
  let col = 13

  while (col <= 25) {
    yield [index, { col, row: 22 }] as const
    index += 1

    yield [index, { col, row: 24 }] as const
    index += 1

    col += 1
  }
}
