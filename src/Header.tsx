import { css, cx } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { useHistory } from "https://cdn.skypack.dev/react-router-dom"
import { functions } from "./firebase.js"

export function Header({
  className,
  style,
  ...props
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const navigate = useNavigate()

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
          background-color: var(--black-alpha);
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

          const { gameId } = data.details
          navigate(`/games/${gameId}`)
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

          const { gameId } = data.details
          navigate(`/games/${gameId}`)
        }}
      >
        神経衰弱を始める（データ初期化）
      </button>
    </div>
  )
}

function useNavigate() {
  const history = useHistory()

  return (pathname: string) => {
    history.push({
      pathname,
      search: location.search,
      hash: location.hash,
    })
  }
}
