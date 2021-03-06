import { css } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useState } from "https://cdn.skypack.dev/react"
import {
  useDispatch,
  useSelector,
  useStore,
} from "https://cdn.skypack.dev/react-redux"
import { ActiveIndicatorContainer } from "./ActiveIndicatorContainer.js"
import { Card } from "./Card.js"
import { ContextMenu } from "./ContextMenu.js"
import { firestore } from "./firebase.js"
import { Grid } from "./Grid.js"
import { PanzoomContainer } from "./Panzoom.js"
import { useCollection } from "./piles.js"
import { Portal } from "./Portal.js"
import type { Card as CardType, Pile } from "./reducer.js"
import { byCR, byId, hasCard, ms } from "./util.js"

export function Board() {
  const dispatch = useDispatch()
  const piles = useSelector(state => state.piles)
  const tempCardPosition = useSelector(state => state.tempCardPosition)
  const tempCardSurface = useSelector(state => state.tempCardSurface)
  const userId = useSelector(state => state.user.id)

  const store = useStore()
  const pilesRef = useCollection()
  const db = pilesRef.firestore

  useEffect(() => {
    const timer = setInterval(() => {
      const state = store.getState()

      if (
        Object.keys(state.tempCardPosition).length === 0 &&
        Object.keys(state.tempCardSurface).length === 0
      )
        return

      dispatch({
        type: "Card.ClearTempInfo",
        payload: {
          timestamp: Date.now() - 10_000,
        },
      })
    }, 10_000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const [contextMenu, setContextMenu] = useState<{
    cardId: CardType["id"]
    x: number
    y: number
  }>()
  const closeContextMenu = () => {
    setContextMenu(undefined)
  }

  return (
    <PanzoomContainer
      maxZoom={10}
      minZoom={0.2}
      noPannableSelector="[data-no-pannable]"
      onInit={panzoom => {
        panzoom.moveTo(
          -(1000 - document.documentElement.clientWidth / 2),
          -(1000 - document.documentElement.clientHeight / 2),
        )
      }}
      className={css`
        width: 2000px;
        height: 2000px;
        background: url("/assets/bg/bg.svg") no-repeat;
        background-size: 1500px 1500px;
        background-position: center;
      `}
    >
      <Grid
        className={css`
          color: var(--green-alpha);
        `}
      />

      <Portal>
        {contextMenu && (
          <ContextMenu
            onOutsideClick={closeContextMenu}
            style={{
              transform: `translate(${contextMenu.x}px, ${contextMenu.y}px)`,
            }}
          >
            <ContextMenu.Item
              disabled={(() => {
                const state = store.getState()

                const { cardId } = contextMenu
                const target = piles.find(hasCard(byId(cardId)))
                if (!target) {
                  return true
                }

                if (target.dragging && target.dragging !== state.user.id) {
                  return true
                }
              })()}
              // TODO コピペ実装のリファクタリング
              onClick={async () => {
                closeContextMenu()

                const { cardId } = contextMenu
                const surface = piles.flatMap(p => p.cards).find(byId(cardId))
                  ?.surface
                if (!surface) return

                const nextSurface = surface === "back" ? "face" : "back"

                const timestamp = Date.now()
                dispatch({
                  type: "Card.DoubleTap",
                  payload: {
                    cardId,
                    nextSurface,
                    timestamp,
                  },
                })

                const state = store.getState()

                const fromPile = state.piles.find(hasCard(byId(cardId)))
                if (fromPile) {
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
                        dragging: firestore.FieldValue.delete(),
                        cards: from.cards.map(c => {
                          if (c.id !== cardId) {
                            return c
                          }

                          return {
                            ...c,
                            surface: nextSurface,
                          }
                        }),
                      })
                    })
                    .catch(console.warn)

                  // Transaction の結果が onSnapshot リスナーに伝わるまである程度待つ
                  await ms(400)
                }

                dispatch({
                  type: "Card.DoubleTap.Finished",
                  payload: {
                    cardId,
                    timestamp,
                  },
                })
              }}
            >
              めくる
            </ContextMenu.Item>

            <ContextMenu.Item
              disabled={(() => {
                const { cardId } = contextMenu
                const target = piles.find(hasCard(byId(cardId)))
                if (!target) {
                  return true
                }

                if (!target.dragging) {
                  return true
                }
              })()}
              onClick={() => {
                closeContextMenu()

                const { cardId } = contextMenu

                const state = store.getState()

                const fromPile = state.piles.find(hasCard(byId(cardId)))
                if (fromPile) {
                  db.runTransaction(async t => {
                    const fromRef = pilesRef.doc(fromPile.id)
                    const from = await t.get(fromRef).then(d => d.data())

                    if (!from) return

                    t.update(fromRef, {
                      dragging: firestore.FieldValue.delete(),
                    })
                  }).catch(console.warn)
                }
              }}
            >
              ロックを解除する
            </ContextMenu.Item>

            <ContextMenu.Item
              disabled={(() => {
                const state = store.getState()

                const { cardId } = contextMenu
                const target = piles.find(hasCard(byId(cardId)))
                if (!target) {
                  return true
                }

                if (target.dragging === state.user.id) {
                  return true
                }
              })()}
              onClick={() => {
                closeContextMenu()

                const { cardId } = contextMenu

                const state = store.getState()

                const fromPile = state.piles.find(hasCard(byId(cardId)))
                if (fromPile) {
                  db.runTransaction(async t => {
                    const fromRef = pilesRef.doc(fromPile.id)
                    const from = await t.get(fromRef).then(d => d.data())

                    if (!from) return

                    t.update(fromRef, {
                      dragging: state.user.id,
                    })
                  }).catch(console.warn)
                }
              }}
            >
              ロックする
            </ContextMenu.Item>
          </ContextMenu>
        )}
      </Portal>

      {piles
        .flatMap(({ cards, col, row, dragging }) => {
          return cards.map(
            (
              { id: cardId, text, src, surface: _surface },
              index,
              { length },
            ) => {
              const temp = tempCardPosition[cardId]
              const surface = tempCardSurface[cardId]?.surface ?? _surface

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
                  onContextMenu={e => {
                    const { clientX, clientY } = e

                    setContextMenu({
                      cardId,
                      x: clientX,
                      y: clientY,
                    })
                  }}
                  // TODO イベントハンドラー内に大きなロジック書きたくないよね
                  onDoubleTap={async () => {
                    const nextSurface = surface === "back" ? "face" : "back"

                    const timestamp = Date.now()
                    dispatch({
                      type: "Card.DoubleTap",
                      payload: {
                        cardId,
                        nextSurface,
                        timestamp,
                      },
                    })

                    const state = store.getState()

                    const fromPile = state.piles.find(hasCard(byId(cardId)))
                    if (fromPile) {
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
                            dragging: firestore.FieldValue.delete(),
                            cards: from.cards.map(c => {
                              if (c.id !== cardId) {
                                return c
                              }

                              return {
                                ...c,
                                surface: nextSurface,
                              }
                            }),
                          })
                        })
                        .catch(console.warn)

                      // Transaction の結果が onSnapshot リスナーに伝わるまである程度待つ
                      await ms(400)
                    }

                    dispatch({
                      type: "Card.DoubleTap.Finished",
                      payload: {
                        cardId,
                        timestamp,
                      },
                    })
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
                      const toPile = state.piles.find(byCR(dest.col, dest.row))

                      const timer = setTimeout(() => {
                        dispatch({
                          type: "Card.AwaitTransaction",
                          payload: {
                            timestamp,
                          },
                        })
                      }, 1_000)

                      let canceled = false
                      ms(2_000).then(() => {
                        canceled = true
                      })

                      await db
                        .runTransaction(async t => {
                          if (canceled) {
                            throw new Error("Firestore.runTransaction canceled")
                          }

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

                          const fromCards = from.cards?.filter(byId.not(cardId))
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
                        .catch(e => {
                          console.warn(e)

                          // トランザクション失敗時に掴みっぱなしにならないよう掃除
                          db.runTransaction(async t => {
                            const fromRef = pilesRef.doc(fromPile.id)
                            const from = await t
                              .get(fromRef)
                              .then(d => d.data())

                            if (!from) return
                            if (from.dragging !== state.user.id) return

                            t.update(fromRef, {
                              dragging: firestore.FieldValue.delete(),
                            })
                          }).catch(console.warn)
                        })

                      clearTimeout(timer)
                      dispatch({
                        type: "Card.AwaitTransaction.Finished",
                        payload: {
                          timestamp,
                        },
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

      <ActiveIndicatorContainer />
    </PanzoomContainer>
  )
}
