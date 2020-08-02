import { css } from "https://cdn.skypack.dev/emotion"
import React, { CSSProperties } from "https://cdn.skypack.dev/react"
import { Board } from "./Board.js"
import { mode } from "./mode.js"

export function View({
  className,
  style,
  ...props
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={style} {...props}>
      {mode === "debug" && (
        <div
          className={css`
            position: fixed;
            z-index: 1000;
            width: 100%;
            height: 40px;
            padding: 0 8px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            background-color: hsla(1, 0%, 50%, 0.5);
          `}
        >
          <button type="button">Firestore のデータを初期化</button>
        </div>
      )}

      <Board />
    </div>
  )
}
