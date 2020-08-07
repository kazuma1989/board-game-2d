import { css, cx } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import type { CSSProperties } from "react"
import { allCards } from "./allCards.js"
import { useCollection } from "./piles.js"
import type { Card } from "./reducer.js"
import { randomID, shuffle } from "./util.js"

export function Header({
  className,
  style,
  ...props
}: {
  className?: string
  style?: CSSProperties
}) {
  const pilesRef = useCollection()

  return (
    <div
      className={cx(
        css`
          position: fixed;
          z-index: 1000;
          width: 100%;
          height: 40px;
          padding: 0 8px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background-color: hsla(0, 0%, 50%, 0.5);
        `,
        className,
      )}
      style={style}
      {...props}
    >
      <button
        type="button"
        onClick={async () => {
          const _allCards = [...allCards]
          shuffle(_allCards)

          const batch = pilesRef.firestore.batch()

          for (let i = 0, col = 13; col - 13 < 13; col += 1) {
            for (let row = 16; row - 16 < 8; row += 2, i++) {
              const card = _allCards[i]

              batch.set(pilesRef.doc([col, row].join(",")), {
                cards: [
                  {
                    ...card,
                    id: randomID() as Card["id"],
                    surface: "back",
                  },
                ],
                col,
                row,
              })
            }
          }

          await batch.commit()
        }}
      >
        Firestore のデータを初期化
      </button>
    </div>
  )
}
