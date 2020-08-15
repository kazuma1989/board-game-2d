import { css } from "https://cdn.skypack.dev/emotion"
import React, { useState } from "https://cdn.skypack.dev/react"
import { useStore } from "https://cdn.skypack.dev/react-redux"
import { useHistory } from "https://cdn.skypack.dev/react-router-dom"
import { ContextMenu } from "./ContextMenu.js"
import { firestore, functions } from "./firebase.js"

export function DebugMenu() {
  const [menuVisible, setMenuVisible] = useState(false)
  const toggle = () => setMenuVisible(v => !v)
  const close = () => setMenuVisible(false)

  const navigate = useNavigate()

  const store = useStore()

  return (
    <div
      className={css`
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 10000;
      `}
    >
      <button type="button" onClick={toggle}>
        Debug
      </button>

      {menuVisible && (
        <ContextMenu onOutsideClick={close}>
          <ContextMenu.Item
            onClick={() => {
              close()

              navigate("/")
            }}
          >
            Home
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={() => {
              close()

              navigate("/sign-in")
            }}
          >
            SignIn
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={async () => {
              close()

              const { data } = await functions.httpsCallable("games")({
                type: "speed",
              })

              const { gameId } = data.details
              navigate(`/games/${gameId}`)
            }}
          >
            Game (type=speed) 作成
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={async () => {
              close()

              const state = store.getState()

              const { docs } = await firestore()
                .collectionGroup("applicants")
                .where("gameOwner", "==", state.user.id)
                .get()

              console.log(docs.map(d => d.data()))
            }}
          >
            collectionGroup("applicants")
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={async () => {
              close()

              const [, , gameId] = location.pathname.split("/")

              const gameRef = firestore().collection("games").doc(gameId)
              const game = await gameRef.get().then(d => d.data())

              const userId = "QM3Yv0kshz1dyNaNiabU"

              await gameRef.collection("applicants").doc(userId).set({
                gameOwner: game?.owner,
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
              })
            }}
          >
            参加希望を送ってもらう
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={() => {
              close()

              navigate("/not-defined-path-so-fallback-to-404")
            }}
          >
            NotFound
          </ContextMenu.Item>
        </ContextMenu>
      )}
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
