import { css } from "https://cdn.skypack.dev/emotion"
import Panzoom from "https://cdn.skypack.dev/panzoom"
import React, {
  useEffect,
  useMemo,
  useRef,
} from "https://cdn.skypack.dev/react"
import {
  useDispatch,
  useSelector,
  useStore,
} from "https://cdn.skypack.dev/react-redux"
import { firestore } from "./firebase.js"
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

  useSnapshot()

  const store = useStore()
  const db = useMemo(() => firestore(), [])
  const pilesRef = useMemo(
    // TODO collection は Context で持ってくるのがよいか？
    () => db.collection("/games/1xNV05bl2ISPqgCjSQTq/piles"),
    [],
  )

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
        // TODO イベントハンドラー内に大きなロジック書きたくないよね
        onDrop={async dest => {
          const state = store.getState()
          const draggingPile = state.piles.find(
            p => p.dragging === state.user.id,
          )
          if (!draggingPile) return

          const pileRef = pilesRef.doc(draggingPile.id)

          await db.runTransaction(async t => {
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
            // TODO イベントハンドラー内に大きなロジック書きたくないよね
            onDragStart={async () => {
              const pileRef = pilesRef.doc(pile.id)

              await db
                .runTransaction(async t => {
                  const pile$ = await t.get(pileRef)
                  if (pile$.data()?.dragging) {
                    throw "locked"
                  }

                  const state = store.getState()
                  t.update(pileRef, {
                    dragging: state.user.id,
                  })
                })
                .catch(console.warn)
            }}
            // TODO イベントハンドラー内に大きなロジック書きたくないよね
            // TODO onDragEnd と onDrop が連続発生すると Firestore が 400 エラーを返してうまくいかない
            // onDragEnd={async () => {
            //   const pileRef = pilesRef.doc(pile.id)

            //   await db.runTransaction(async t => {
            //     const pile$ = await t.get(pileRef)

            //     const state = store.getState()
            //     if (pile$.data()?.dragging !== state.user.id) return

            //     t.update(pileRef, {
            //       dragging: firestore.FieldValue.delete(),
            //     })
            //   })
            // }}
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

function useSnapshot() {
  const dispatch = useDispatch()

  useEffect(() => {
    // TODO collection は Context で持ってくるのがよいか？
    const pilesRef = firestore().collection("/games/1xNV05bl2ISPqgCjSQTq/piles")

    return pilesRef.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case "added": {
            return
          }

          case "modified": {
            dispatch({
              type: "Firestore.Update.Pile",
              payload: {
                id: change.doc.id,
                pile: change.doc.data(),
              },
            })

            return
          }

          case "removed": {
            return
          }
        }
      })
    })
  }, [dispatch])
}
