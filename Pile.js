// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.skypack.dev/emotion";
import {
  html,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";

export function Pile({
  cards,
  x,
  y,
  className,
  style,
  onDragStart,
  onDragEnd,
  onDrop,
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
      onDragOver=${(e) => {
        e.preventDefault();
      }}
      onDrop=${() => {
        onDrop?.();
      }}
      className=${cx(
        css`
          position: absolute;
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
      ${cards.map(({ text }, i, { length }) => {
        return html`
          <${Card}
            key=${i}
            text=${text}
            className=${css`
              position: absolute;
            `}
            style=${length <= 5
              ? {
                  left: -3 * i,
                  top: -2 * i,
                }
              : {
                  left: -1 * i,
                  top: -0.5 * i,
                }}
          />
        `;
      })}
    </div>
  `;
}

function Card({ text, className, ...props }) {
  return html`
    <div
      className=${cx(
        css`
          border: solid 1px gray;
          width: 50px;
          height: 70px;
          box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.4);
          background-color: white;
          cursor: move;
        `,
        className
      )}
      ...${props}
    >
      ${text}
    </div>
  `;
}
