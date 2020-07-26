// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.skypack.dev/emotion";
import {
  html,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";

export function Card({
  x,
  y,
  className,
  style,
  onDragStart,
  onDragEnd,
  ...props
}) {
  const [dragging, setDragging] = useState(false);

  return html`
    <div
      draggable
      onDragStart=${() => {
        setDragging(true);
        onDragStart?.();
      }}
      onDragEnd=${() => {
        setDragging(false);
        onDragEnd?.();
      }}
      className=${cx(
        css`
          border: solid 1px gray;
          width: 50px;
          height: 70px;
          position: absolute;
          box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.1);
          background-color: white;
          cursor: move;
        `,
        dragging &&
          css`
            opacity: 0.5;
          `,
        className
      )}
      style=${{
        left: x,
        top: y,
        ...style,
      }}
      ...${props}
    >
      Card
    </div>
  `;
}
