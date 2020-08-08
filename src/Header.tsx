import { css, cx } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { useDispatch } from "https://cdn.skypack.dev/react-redux"
import type { CSSProperties } from "react"
import { app } from "./firebase.js"

const functions = app().functions("asia-northeast1")

export function Header({
  className,
  style,
  ...props
}: {
  className?: string
  style?: CSSProperties
}) {
  const dispatch = useDispatch()

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
          const { data } = await functions.httpsCallable("games")({
            type: "speed",
          })
          if (data.error) {
            console.error(data)
            return
          }

          const [collection] = data.payload.collections
          dispatch({
            type: "Game.Created",
            payload: {
              collection,
            },
          })
        }}
      >
        スピードを始める（データ初期化）
      </button>

      <button
        type="button"
        onClick={async () => {
          const { data } = await functions.httpsCallable("games")({
            type: "shinkei-suijaku",
          })
          if (data.error) {
            console.error(data)
            return
          }

          const [collection] = data.payload.collections
          dispatch({
            type: "Game.Created",
            payload: {
              collection,
            },
          })
        }}
      >
        神経衰弱を始める（データ初期化）
      </button>
    </div>
  )
}
