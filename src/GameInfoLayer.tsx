import { css } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useState } from "https://cdn.skypack.dev/react"
import { useSelector } from "https://cdn.skypack.dev/react-redux"
import { firestore } from "./firebase.js"
import { Portal } from "./Portal.js"

export function GameInfoLayer() {
  const gameId = useSelector(state => state.game?.id)

  const [applicants, setApplicants] = useState([] as { id: string }[])
  useEffect(() => {
    if (!gameId) return

    firestore()
      .collection("games")
      .doc(gameId)
      .collection("applicants")
      .onSnapshot(applicants$ => {
        setApplicants(
          applicants$.docs.map(d => ({
            id: d.id,
            ...d.data(),
          })),
        )
      })
  }, [gameId])

  return (
    <Portal>
      {applicants.length >= 1 && (
        <div
          className={css`
            position: fixed;
            z-index: 1100;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: blur(8px);

            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <article
            className={css`
              width: 100%;
              max-height: 100%;
              padding: 1.2em;
              border: solid 1px silver;
              background-color: white;
              box-shadow: var(--shadow-wide);
              overflow: auto;
            `}
          >
            <p>参加希望</p>

            <ul>
              {applicants.map(a => {
                return <li key={a.id}>{a.id}</li>
              })}
            </ul>
          </article>
        </div>
      )}
    </Portal>
  )
}
