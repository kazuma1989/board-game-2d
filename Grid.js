// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.skypack.dev/emotion";
import {
  html,
  useRef,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";
import { mode } from "./mode.js";

export function Grid({ onDrop, className, ...props }) {
  const container$ = useRef();

  const [dragging, setDragging] = useState(false);
  const draggingPosition$ = useRef({ x: 0, y: 0 });

  return html`
    <div
      ref=${container$}
      onMouseDown=${/** @param {MouseEvent} e */ (e) => {}}
      onMouseMove=${/** @param {MouseEvent} e */ (e) => {}}
      onMouseUp=${/** @param {MouseEvent} e */ (e) => {}}
      onDragOver=${/** @param {DragEvent} e */ (e) => {
        e.preventDefault();

        if (!dragging) {
          setDragging(true);
        }

        const { offsetX, offsetY } = e;
        const snappedX = offsetX - (offsetX % 50);
        const snappedY = offsetY - (offsetY % 50);

        draggingPosition$.current.x = snappedX;
        draggingPosition$.current.y = snappedY;

        if (!container$.current) return;
        container$.current.style.backgroundPosition = `${snappedX}px ${snappedY}px`;
      }}
      onDragLeave=${() => {
        setDragging(false);

        if (!container$.current) return;
        container$.current.style.backgroundPosition = null;
      }}
      onDrop=${() => {
        setDragging(false);

        const { x, y } = draggingPosition$.current;
        onDrop?.({
          col: x / 50,
          row: y / 50,
          x,
          y,
        });

        if (!container$.current) return;
        container$.current.style.backgroundPosition = null;
      }}
      className=${cx(
        css`
          position: relative;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
        `,
        className,
        mode === "debug" &&
          css`
            background-position: top left;
            background-image: repeating-linear-gradient(
                90deg,
                currentColor 0px,
                currentColor 0.5px,
                transparent 0.5px,
                transparent 49.5px,
                currentColor 49.5px,
                currentColor 50px
              ),
              repeating-linear-gradient(
                180deg,
                currentColor 0px,
                currentColor 0.5px,
                transparent 0.5px,
                transparent 49.5px,
                currentColor 49.5px,
                currentColor 50px
              );
          `,
        dragging &&
          css`
            background-repeat: no-repeat;
            background-size: 50px 50px;
            background-image: linear-gradient(currentColor, currentColor);
          `
      )}
      ...${props}
    ></div>
  `;
}
