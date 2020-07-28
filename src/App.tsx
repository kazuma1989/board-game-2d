import { css } from "https://cdn.skypack.dev/emotion"
import produce from "https://cdn.skypack.dev/immer"
import Panzoom from "https://cdn.skypack.dev/panzoom/"
import React, {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/preact/compat"
import { Grid } from "./Grid.js"
import { Pile } from "./Pile.js"
import { randomID } from "./util.js"

export function App() {
  const container$ = useRef<HTMLDivElement>()
  useEffect(() => {
    const container = container$.current
    if (!container) return

    const p = Panzoom(container, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: false,
      zoomDoubleClickSpeed: 2.5,

      /**
       * @returns should ignore
       */
      beforeMouseDown(e: MouseEvent): boolean | undefined {
        if (e.shiftKey) {
          return true
        }

        if (
          e.target instanceof HTMLElement &&
          !("pannable" in e.target.dataset)
        ) {
          return true
        }
      },
    })

    return () => {
      p.dispose()
    }
  }, [container$])

  const [piles, setPiles] = useState(initPiles)
  const draggingIndex$ = useRef({ col: -1, row: -1 })

  const prevDest$ = useRef({ col: -1, row: -1 })

  return (
    <div
      ref={container$}
      className={css`
        width: 1000px;
        height: 1000px;
        background: url(/bg.svg) no-repeat;
        background-size: cover;
        background-position: center;
      `}
      data-pannable
    >
      <Grid
        onMove={dest => {
          const prev = prevDest$.current
          if (prev.col === dest.col && prev.row === dest.row) return

          prevDest$.current = {
            col: dest.col,
            row: dest.row,
          }

          setPiles(
            produce((draft: typeof piles) => {
              const pile = draft[dest.row][dest.col]
              console.log(pile, dest)
              if (!pile) return

              pile.selected = true
            }),
          )
        }}
        onDrop={dest => {
          const { row, col } = draggingIndex$.current
          if (row === -1 || col === -1) return
          if (row === dest.row && col === dest.col) return

          setPiles(
            produce((draft: typeof piles) => {
              draft[dest.row][dest.col] = draft[row][col]
              draft[row][col] = null
            }),
          )
        }}
        className={css`
          color: rgba(0, 255, 0, 0.4);
        `}
        data-pannable
      />

      {piles.flatMap((rowPiles, row) => {
        return rowPiles.map((pile, col) => {
          if (!pile) return

          const dest = {
            row,
            col,
          }

          return (
            <Pile
              className={
                pile.selected &&
                css`
                  > * {
                    border-color: red !important;
                  }
                `
              }
              key={pile.id}
              cards={pile.cards}
              x={50 * (col - 10)}
              y={50 * (row - 10)}
              onDragStart={() => {
                draggingIndex$.current = { col, row }
              }}
              onDragEnd={() => {
                draggingIndex$.current = { col: -1, row: -1 }
              }}
              onDrop={() => {
                const { row, col } = draggingIndex$.current
                draggingIndex$.current = { col: -1, row: -1 }

                if (row === -1 || col === -1) return
                if (row === dest.row && col === dest.col) return

                setPiles(
                  produce((draft: typeof piles) => {
                    draft[dest.row][dest.col]?.cards.push(
                      ...(draft[row][col]?.cards ?? []),
                    )
                    draft[row][col] = null
                  }),
                )
              }}
            />
          )
        })
      })}
    </div>
  )
}

type Pile = {
  id: string & { readonly u: unique symbol }
  cards: { text: string }[]
  selected?: boolean
}

const initPiles = [...Array(40)].map(() =>
  [...Array(40)].map(() => {
    if (Math.random() <= 0.95) {
      return null
    }

    const pile: Pile = {
      id: randomID() as Pile["id"],
      cards: [{ text: "card" }],
    }

    return pile
  }),
)
