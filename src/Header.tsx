import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useState } from "https://cdn.skypack.dev/react"
import { useSelector } from "https://cdn.skypack.dev/react-redux"
import { useHistory } from "https://cdn.skypack.dev/react-router-dom"
import { firestore, functions } from "./firebase.js"

export function Header({
  className,
  style,
  ...props
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const navigate = useNavigate()

  const gameId = useSelector(state => state.game?.id)

  const [applicants, setApplicants] = useState(0)
  useEffect(() => {
    if (!gameId) return

    firestore()
      .collection("games")
      .doc(gameId)
      .collection("applicants")
      .onSnapshot(applicants$ => {
        setApplicants(applicants$.docs.length)
      })
  }, [gameId])

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
      <div>{applicants} 件の参加希望</div>

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
