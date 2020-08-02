import { css } from "https://cdn.skypack.dev/emotion"
import Panzoom from "https://cdn.skypack.dev/panzoom"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"
import {
  useDispatch,
  useSelector,
  useStore,
} from "https://cdn.skypack.dev/react-redux"
import { Card } from "./Card.js"
import { firestore } from "./firebase.js"
import { Grid } from "./Grid.js"
import { useCollection } from "./piles.js"
import { Provider } from "./useScale.js"
import { byCR, byId } from "./util.js"

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
  const userId = useSelector(state => state.user.id)

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

        {piles
          .flatMap(({ id: pileId, cards, col, row, dragging }) => {
            return cards.map(({ id: cardId, text, src, state }, index) => {
              return (
                <Card
                  data-no-pannable
                  key={cardId}
                  col={col}
                  row={row}
                  index={index}
                  locked={dragging && dragging !== userId}
                  text={text}
                  src={src[state]}
                  // TODO イベントハンドラー内に大きなロジック書きたくないよね
                  onMoveStart={async () => {
                    dispatch({
                      type: "Pile.DragStart",
                      payload: {
                        pileId,
                      },
                    })

                    const pileRef = pilesRef.doc(pileId)

                    const failed = await pileRef.firestore
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
                      .catch(() => true)

                    if (!failed) {
                      dispatch({
                        type: "Pile.DragStart.Success",
                        payload: {
                          pileId,
                        },
                      })
                    } else {
                      dispatch({
                        type: "Pile.DragStart.Failed",
                        payload: {
                          pileId,
                        },
                      })
                    }
                  }}
                  // TODO イベントハンドラー内に大きなロジック書きたくないよね
                  onMoveEnd={async dest => {
                    const state = store.getState()

                    dispatch({
                      type: "Card.MoveEnd",
                      payload: {
                        cardId,
                        col: dest.col,
                        row: dest.row,
                      },
                    })

                    const fromPile = state.piles.find(p =>
                      p.cards.some(c => c.id === cardId),
                    )
                    if (!fromPile) return

                    const toPile = state.piles.find(byCR(dest.col, dest.row))
                    if (toPile) {
                      if (toPile.id === fromPile.id) {
                        // pile から card を取り上げたが同じ pile に戻した

                        const pileRef = pilesRef.doc(fromPile.id)

                        await pileRef.firestore.runTransaction(async t => {
                          const pile$ = await t.get(pileRef)

                          const userId = store.getState().user.id
                          const pile = pile$.data() ?? {}
                          if (pile.dragging !== userId) return

                          t.update(pileRef, {
                            dragging: firestore.FieldValue.delete(),
                          })
                        })
                      } else {
                        // pile 内の card を別の pile に移した

                        const fromRef = pilesRef.doc(fromPile.id)
                        const toRef = pilesRef.doc(toPile.id)

                        await fromRef.firestore.runTransaction(async t => {
                          const [from$, to$] = await Promise.all([
                            t.get(fromRef),
                            t.get(toRef),
                          ])

                          const userId = store.getState().user.id
                          const from = from$.data() ?? {}
                          if (from.dragging !== userId) return

                          const to = to$.data() ?? {}
                          if (to.dragging && to.dragging !== userId) return

                          const card = from.cards?.find(byId(cardId))
                          if (!card) return

                          const fromCards = from.cards?.filter(byId.not(cardId))
                          if (fromCards?.length) {
                            t.update(fromRef, {
                              cards: fromCards,
                              dragging: firestore.FieldValue.delete(),
                            })
                          } else {
                            t.delete(fromRef)
                          }

                          t.update(toRef, {
                            cards: [...to.cards, card],
                            dragging: firestore.FieldValue.delete(),
                          })
                        })
                      }
                    } else {
                      // pile から card を取り上げ、別の pile のない空間に置いた

                      const fromRef = pilesRef.doc(fromPile.id)
                      const toRef = pilesRef
                        .where("col", "==", dest.col)
                        .where("row", "==", dest.row)

                      // TODO spaces collection に予約 doc を作ってロックをとる設計にする

                      // await fromRef.firestore.runTransaction(async t => {
                      //   const [from$, to$] = await Promise.all([
                      //     t.get(fromRef),
                      //     t.get(toRef),
                      //   ])
                      // })
                    }
                  }}
                />
              )
            })
          })
          .sort(
            (e1, e2) =>
              e1.key?.toString().localeCompare(e2.key?.toString() ?? "") ?? 0,
          )}
      </div>
    </Provider>
  )
}
