import { css } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useRef } from "https://cdn.skypack.dev/react"
import {
  useDispatch,
  useSelector,
  useStore,
} from "https://cdn.skypack.dev/react-redux"
import { Card } from "./Card.js"
import { firestore } from "./firebase.js"
import { Grid } from "./Grid.js"
import { initPanzoom } from "./Panzoom.js"
import { useCollection } from "./piles.js"
import type { Pile } from "./reducer.js"
import { Provider } from "./useScale.js"
import { byCR, byId, hasCard, ms } from "./util.js"

export function Board() {
  const scale$ = useRef(1)

  const container$ = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = container$.current
    if (!container) return

    const panzoom = initPanzoom(
      container,
      {
        maxZoom: 10,
        minZoom: 0.2,
      },
      {
        noPannableSelector: "[data-no-pannable]",
      },
    )

    panzoom.moveTo(
      -(1000 - document.body.clientWidth / 2),
      -(1000 - document.body.clientHeight / 2),
    )

    panzoom.on("zoom", e => {
      scale$.current = e.getTransform().scale
    })

    return () => {
      panzoom.dispose()
    }
  }, [])

  const dispatch = useDispatch()
  const piles = useSelector(state => state.piles)
  const tempCardPosition = useSelector(state => state.tempCardPosition)
  const userId = useSelector(state => state.user.id)

  const store = useStore()
  const pilesRef = useCollection()
  const db = pilesRef.firestore

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
          .flatMap(({ cards, col, row, dragging }) => {
            return cards.map(
              ({ id: cardId, text, src, surface }, index, { length }) => {
                const temp = tempCardPosition[cardId]

                return (
                  <Card
                    data-no-pannable
                    key={cardId}
                    col={temp?.col ?? col}
                    row={temp?.row ?? row}
                    index={temp ? length : index}
                    length={length}
                    locked={dragging && dragging !== userId}
                    text={text}
                    src={src}
                    surface={surface}
                    // TODO イベントハンドラー内に大きなロジック書きたくないよね
                    onDoubleTap={async () => {
                      const state = store.getState()

                      const fromPile = state.piles.find(hasCard(byId(cardId)))
                      if (!fromPile) return

                      await db
                        .runTransaction(async t => {
                          const fromRef = pilesRef.doc(fromPile.id)
                          const from = (await t
                            .get(fromRef)
                            .then(d => d.data())) as Pile | undefined

                          if (!from) return
                          if (from.dragging && from.dragging !== state.user.id)
                            return

                          t.update(fromRef, {
                            cards: from.cards.map(c => {
                              if (c.id !== cardId) {
                                return c
                              }

                              return {
                                ...c,
                                surface: c.surface === "back" ? "face" : "back",
                              }
                            }),
                          })
                        })
                        .catch(console.warn)
                    }}
                    // TODO イベントハンドラー内に大きなロジック書きたくないよね
                    onMoveStart={async () => {
                      const state = store.getState()

                      const fromPile = state.piles.find(hasCard(byId(cardId)))
                      if (!fromPile) return

                      await db
                        .runTransaction(async t => {
                          const fromRef = pilesRef.doc(fromPile.id)
                          const from = await t.get(fromRef).then(d => d.data())

                          if (!from) return
                          if (from.dragging && from.dragging !== state.user.id)
                            return

                          t.update(fromRef, {
                            dragging: state.user.id,
                          })
                        })
                        .catch(console.warn)
                    }}
                    // TODO イベントハンドラー内に大きなロジック書きたくないよね
                    onMoveEnd={async dest => {
                      const timestamp = Date.now()
                      dispatch({
                        type: "Card.MoveEnd",
                        payload: {
                          cardId,
                          col: dest.col,
                          row: dest.row,
                          timestamp,
                        },
                      })

                      const state = store.getState()

                      const fromPile = state.piles.find(hasCard(byId(cardId)))
                      if (fromPile) {
                        const toPile = state.piles.find(
                          byCR(dest.col, dest.row),
                        )

                        const timer = setTimeout(() => {
                          dispatch({
                            type: "Card.AwaitTransaction",
                          })
                        }, 1_000)

                        await db
                          .runTransaction(async t => {
                            const fromRef = pilesRef.doc(fromPile.id)
                            const toRef = pilesRef.doc(
                              toPile?.id || [dest.col, dest.row].join(","),
                            )
                            const [from, to] = await Promise.all([
                              t.get(fromRef).then(d => d.data()),
                              t.get(toRef).then(d => d.data()),
                            ])

                            if (!from) return
                            if (from.dragging !== state.user.id) return

                            t.update(fromRef, {
                              dragging: firestore.FieldValue.delete(),
                            })

                            // card を取り上げたものの同じ pile に戻した
                            if (fromRef.isEqual(toRef)) return

                            if (to?.dragging && to.dragging !== state.user.id)
                              return

                            const card = from.cards?.find(byId(cardId))
                            if (!card) return

                            const fromCards = from.cards?.filter(
                              byId.not(cardId),
                            )
                            if (fromCards?.length) {
                              t.update(fromRef, {
                                cards: fromCards,
                              })
                            } else {
                              t.delete(fromRef)
                            }

                            t.set(toRef, {
                              cards: [...(to?.cards ?? []), card],
                              col: dest.col,
                              row: dest.row,
                            })
                          })
                          .catch(console.warn)

                        clearTimeout(timer)
                        dispatch({
                          type: "Card.AwaitTransaction.Finished",
                        })

                        // Transaction の結果が onSnapshot リスナーに伝わるまである程度待つ
                        await ms(400)
                      }

                      dispatch({
                        type: "Card.MoveEnd.Finished",
                        payload: {
                          cardId,
                          timestamp,
                        },
                      })
                    }}
                  />
                )
              },
            )
          })
          .sort(
            (e1, e2) =>
              e1.key?.toString().localeCompare(e2.key?.toString() ?? "") ?? 0,
          )}
      </div>
    </Provider>
  )
}
