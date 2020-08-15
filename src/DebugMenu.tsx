import { css } from "https://cdn.skypack.dev/emotion"
import React, { useState } from "https://cdn.skypack.dev/react"
import { useHistory } from "https://cdn.skypack.dev/react-router-dom"
import { ContextMenu } from "./ContextMenu.js"
import { functions } from "./firebase.js"

export function DebugMenu() {
  const [menuVisible, setMenuVisible] = useState(false)
  const toggle = () => setMenuVisible(v => !v)
  const close = () => setMenuVisible(false)

  const navigate = useNavigate()

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
              navigate("/")
              close()
            }}
          >
            Home
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={() => {
              navigate("/sign-in")
              close()
            }}
          >
            SignIn
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={async () => {
              const { data } = await functions.httpsCallable("games")({
                type: "speed",
              })

              const { gameId } = data.details
              navigate(`/games/${gameId}`)

              close()
            }}
          >
            Game (type=speed) 作成
          </ContextMenu.Item>

          <ContextMenu.Item
            onClick={() => {
              navigate("/not-defined-path-so-fallback-to-404")
              close()
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
