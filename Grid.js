// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.skypack.dev/emotion";
import {
  html,
  useRef,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";
import { mode } from "./mode.js";

export function Grid({ onDrop, onSelect, className, ...props }) {
  const container$ = useRef();

  const [dragging, setDragging] = useState(false);
  const draggingPosition$ = useRef({ x: 0, y: 0 });

  const [selecting, setSelecting] = useState(false);
  const selectingPosition$ = useRef({ x: 0, y: 0 });

  return html`
    <div
      ref=${container$}
      onMouseDown=${/** @param {MouseEvent} e */
      (e) => {
        if (!e.shiftKey) return;

        if (!selecting) {
          setSelecting(true);
        }

        const { offsetX, offsetY } = e;

        selectingPosition$.current.x = offsetX;
        selectingPosition$.current.y = offsetY;
      }}
      onMouseMove=${/** @param {MouseEvent} e */
      (e) => {
        if (!selecting) return;

        if (!container$.current) return;

        const { x: startX, y: startY } = selectingPosition$.current;
        const { offsetX, offsetY } = e;

        const [left, right] =
          startX <= offsetX ? [startX, offsetX] : [offsetX, startX];
        const [top, bottom] =
          startY <= offsetY ? [startY, offsetY] : [offsetY, startY];

        container$.current.style.backgroundPosition = `${left}px ${top}px`;
        container$.current.style.backgroundSize = `${right - left}px ${
          bottom - top
        }px`;
      }}
      onMouseUp=${/** @param {MouseEvent} e */
      (e) => {
        setSelecting(false);

        if (selecting) {
          const { x: startX, y: startY } = selectingPosition$.current;
          const { offsetX, offsetY } = e;

          const [left, right] =
            startX <= offsetX ? [startX, offsetX] : [offsetX, startX];
          const [top, bottom] =
            startY <= offsetY ? [startY, offsetY] : [offsetY, startY];

          onSelect?.(
            {
              col: (left - (left % 50)) / 50,
              row: (top - (top % 50)) / 50,
              x: left,
              y: top,
            },
            {
              col: (right - (right % 50)) / 50,
              row: (bottom - (bottom % 50)) / 50,
              x: right,
              y: bottom,
            }
          );
        }

        if (!container$.current) return;
        container$.current.style.backgroundPosition = null;
        container$.current.style.backgroundSize = null;
      }}
      onDragOver=${/** @param {DragEvent} e */
      (e) => {
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
        (dragging || selecting) &&
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
