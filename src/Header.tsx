import { css, cx } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { useDispatch } from "https://cdn.skypack.dev/react-redux"
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
  const dispatch = useDispatch()
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
          const { data } = await functions.httpsCallable("games")({
            type: "speed",
          })
          if (data.error) {
            console.error(data)
            return
          }

          // FIXME 絶妙に collection の扱いがばらばらなのを整理する
          const [collection] = data.payload.collections
          dispatch({
            type: "Game.Created",
            payload: {
              collection,
            },
          })

          // TODO functions を直したほうがいい
          const [, c] = collection.match(/games\/([^/]+)/)
          history.push({
            pathname: `/games/${c}`,
            search: location.search,
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

          // FIXME 絶妙に collection の扱いがばらばらなのを整理する
          const [collection] = data.payload.collections
          dispatch({
            type: "Game.Created",
            payload: {
              collection,
            },
          })

          // TODO functions を直したほうがいい
          const [, c] = collection.match(/games\/([^/]+)/)
          history.push({
            pathname: `/games/${c}`,
            search: location.search,
          })
        }}
      >
        神経衰弱を始める（データ初期化）
      </button>
    </div>
  )
}
