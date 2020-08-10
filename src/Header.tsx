import { css, cx } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { useHistory } from "https://cdn.skypack.dev/react-router-dom"
import type { CSSProperties } from "react"
import { functions } from "./firebase.js"

export function Header({
  className,
  style,
  ...props
}: {
  className?: string
  style?: CSSProperties
}) {
  const history = useHistory()

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
          let data
          try {
            const r = await functions.httpsCallable("games")({
              type: "speed",
            })

            data = r.data
          } catch (e) {
            console.error(e)
            return
          }

          const { gameId } = data.details
          history.push({
            pathname: `/games/${gameId}`,
            search: location.search,
            hash: location.hash,
          })
        }}
      >
        スピードを始める（データ初期化）
      </button>

      <button
        type="button"
        onClick={async () => {
          let data
          try {
            const r = await functions.httpsCallable("games")({
              type: "shinkei-suijaku",
            })

            data = r.data
          } catch (e) {
            console.error(e)
            return
          }

          const { gameId } = data.details
          history.push({
            pathname: `/games/${gameId}`,
            search: location.search,
            hash: location.hash,
          })
        }}
      >
        神経衰弱を始める（データ初期化）
      </button>
    </div>
  )
}
