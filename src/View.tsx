import { css } from "https://cdn.skypack.dev/emotion"
import React, { CSSProperties } from "https://cdn.skypack.dev/react"
import { allCards } from "./allCards.js"
import { Board } from "./Board.js"
import { mode } from "./mode.js"
import { useCollection } from "./piles.js"
import type { Card, Pile } from "./reducer.js"
import { randomID } from "./util.js"

export function View({
  className,
  style,
  ...props
}: {
  className?: string
  style?: CSSProperties
}) {
  const pilesRef = useCollection()

  return (
    <div className={className} style={style} {...props}>
      {mode === "debug" && (
        <div
          className={css`
            position: fixed;
            z-index: 1000;
            width: 100%;
            height: 40px;
            padding: 0 8px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            background-color: hsla(1, 0%, 50%, 0.5);
          `}
        >
          <button
            type="button"
            onClick={async () => {
              const _allCards = [...allCards]
              const cols = [...Array(20).keys()].map(v => v + 9)
              const rows = [...Array(20).keys()].map(v => v + 9)
              const setPileWith = (batch: firebase.firestore.WriteBatch) => (
                ref: firebase.firestore.DocumentReference<
                  firebase.firestore.DocumentData
                >,
              ) => {
                const [card] = _allCards.splice(
                  Math.floor(Math.random() * _allCards.length),
                  1,
                )
                const [col] = cols.splice(
                  Math.floor(Math.random() * cols.length),
                  1,
                )
                const [row] = rows.splice(
                  Math.floor(Math.random() * rows.length),
                  1,
                )

                const pile: Omit<Pile, "id"> = {
                  cards: [
                    {
                      ...card,
                      id: randomID() as Card["id"],
                      state: "face",
                    },
                  ],
                  col,
                  row,
                }

                batch.set(ref, pile)
              }

              const piles$ = await pilesRef.get()

              const b = pilesRef.firestore.batch()
              const setPile = setPileWith(b)

              for (let i = 3 - piles$.size; i > 0; i--) {
                await pilesRef.add({ cards: [] }).then(ref => {
                  setPile(ref)
                })
              }

              piles$.docs.forEach(({ ref }) => {
                setPile(ref)
              })

              await b.commit()
            }}
          >
            Firestore のデータを初期化
          </button>
        </div>
      )}

      <Board />
    </div>
  )
}
