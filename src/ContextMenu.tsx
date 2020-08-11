import { css } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { useSelector } from "https://cdn.skypack.dev/react-redux"

export function ContextMenu() {
  const contextMenu = useSelector(state => state.ui.contextMenu)
  if (!contextMenu) {
    return null
  }

  const { type, x, y } = contextMenu

  return (
    <div
      className={css`
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 4px;

        /* https://brumm.af/shadows */
        /* 6, 0.07, 100px, 150px, 0px */
        box-shadow: 0 2.8px 4.2px rgba(0, 0, 0, 0.02),
          0 6.7px 10px rgba(0, 0, 0, 0.028),
          0 12.5px 18.8px rgba(0, 0, 0, 0.035),
          0 22.3px 33.5px rgba(0, 0, 0, 0.042),
          0 41.8px 62.7px rgba(0, 0, 0, 0.05), 0 100px 150px rgba(0, 0, 0, 0.07);

        ::before,
        ::after {
          content: "";
          display: block;
          height: 8px;
          background-color: #f2f2f2;
          border: solid 1px #aaa;
        }
        ::before {
          border-radius: 4px 4px 0 0;
          border-bottom-color: transparent;
        }
        ::after {
          border-radius: 0 0 4px 4px;
          border-top-color: transparent;
        }
      `}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <MenuItem>Menu 1</MenuItem>
      <MenuItem>Menu 2</MenuItem>
      <MenuItem>Menu 3</MenuItem>
      <MenuItem>Menu 4</MenuItem>
    </div>
  )
}

function MenuItem({ children }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className={css`
        width: 100%;
        border-radius: 0;
        border-top-color: transparent;
        border-bottom-color: transparent;
        text-align: initial;
      `}
    >
      {children}
    </button>
  )
}
