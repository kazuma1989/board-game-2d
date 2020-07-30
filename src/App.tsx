import { css } from "https://cdn.skypack.dev/emotion"
import Panzoom from "https://cdn.skypack.dev/panzoom"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"
import { useDispatch, useSelector } from "https://cdn.skypack.dev/react-redux"
import { Grid } from "./Grid.js"
import { Pile } from "./Pile.js"

export function App() {
  const container$ = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = container$.current
    if (!container) return

    const p = Panzoom(container, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: false,

      // disable double click zoom
      zoomDoubleClickSpeed: 1,

      /** @returns should ignore */
      beforeMouseDown(e: MouseEvent): boolean | undefined {
        if (
          e.target instanceof HTMLElement &&
          e.target.closest("[data-no-pannable]")
        ) {
          return true
        }
      },
    })

    return () => {
      p.dispose()
    }
  }, [container$])

  const dispatch = useDispatch()
  const piles = useSelector(state => state.piles)

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
    >
      <Grid
        onDrop={dest => {
          dispatch({
            type: "Grid.Drop",
            payload: {
              row: dest.row,
              col: dest.col,
            },
          })
        }}
        className={css`
          color: rgba(0, 255, 0, 0.4);
        `}
      />

      {piles.map(({ col, row, ...pile }) => {
        return (
          <Pile
            key={pile.id}
            cards={pile.cards}
            x={50 * (col - 10)}
            y={50 * (row - 10)}
            onDragStart={() => {
              dispatch({
                type: "Pile.DragStart",
                payload: {
                  pileId: pile.id,
                },
              })
            }}
            onDragEnd={() => {
              dispatch({
                type: "Pile.DragEnd",
              })
            }}
            onDragEnter={() => {
              dispatch({
                type: "Pile.DragEnter",
                payload: {
                  pileId: pile.id,
                },
              })
            }}
            onDrop={() => {
              dispatch({
                type: "Pile.Drop",
                payload: {
                  pileId: pile.id,
                },
              })
            }}
            data-no-pannable
          />
        )
      })}
    </div>
  )
}
