import { css } from "https://cdn.skypack.dev/emotion"
import Panzoom from "https://cdn.skypack.dev/panzoom"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"
import {
  useDispatch,
  useSelector,
  useStore,
} from "https://cdn.skypack.dev/react-redux"
import { firestore } from "./firebase.js"
import { Grid } from "./Grid.js"
import { Pile } from "./Pile.js"
import { useCollection } from "./piles.js"
import { Provider } from "./useScale.js"

export function Board() {
  const scale$ = useRef(1)
  const container$ = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = container$.current
    if (!container) return

    const panzoom = Panzoom(container, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: true,

      // disable double click zoom
      zoomDoubleClickSpeed: 1,
    })

    panzoom.moveTo(
      -(1000 - document.body.clientWidth / 2),
      -(1000 - document.body.clientHeight / 2),
    )

    panzoom.on("zoom", e => {
      scale$.current = e.getTransform().scale
    })

    const pause = (e: PointerEvent) => {
      if (!(e.target instanceof HTMLElement)) return
      if (!e.isPrimary) return

      if (e.target.closest("[data-no-pannable]")) {
        panzoom.pause()
      }
    }

    const resume = () => {
      panzoom.resume()
    }

    container.addEventListener("pointerdown", pause, { passive: true })
    container.addEventListener("pointerup", resume, { passive: true })

    return () => {
      panzoom.dispose()

      container.removeEventListener("pointerdown", pause)
      container.removeEventListener("pointerup", resume)
    }
  }, [])

  const dispatch = useDispatch()
  const piles = useSelector(state => state.piles)

  const store = useStore()
  const pilesRef = useCollection()

  return (
    <Provider value={scale$}>
      <div
        ref={container$}
        className={css`
          width: 2000px;
          height: 2000px;
          background: url("/bg.svg") no-repeat;
          background-size: 1500px 1500px;
          background-position: center;
        `}
      >
        <Grid
          className={css`
            color: rgba(0, 255, 0, 0.4);
          `}
        />

        {piles.map(({ col, row, ...pile }) => {
          return (
            <Pile
              key={pile.id}
              cards={pile.cards}
              col={col}
              row={row}
              // TODO イベントハンドラー内に大きなロジック書きたくないよね
              onDragStart={async () => {
                const pileRef = pilesRef.doc(pile.id)

                await pileRef.firestore
                  .runTransaction(async t => {
                    const pile$ = await t.get(pileRef)
                    if (pile$.data()?.dragging) {
                      throw `pile is locked: id=${pile$.id}`
                    }

                    const state = store.getState()
                    t.update(pileRef, {
                      dragging: state.user.id,
                    })
                  })
                  .catch(console.warn)
              }}
              // TODO イベントハンドラー内に大きなロジック書きたくないよね
              onDragEnd={async dest => {
                const pileRef = pilesRef.doc(pile.id)

                await pileRef.firestore.runTransaction(async t => {
                  const pile$ = await t.get(pileRef)

                  const state = store.getState()
                  if (pile$.data()?.dragging !== state.user.id) return

                  t.update(pileRef, {
                    dragging: firestore.FieldValue.delete(),
                    col: dest.col,
                    row: dest.row,
                  })
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
    </Provider>
  )
}
