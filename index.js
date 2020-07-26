// @ts-check
/// <reference path="./typings.d.ts" />

import { css, cx } from "https://cdn.skypack.dev/emotion";
import {
  html,
  render,
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";
import Panzoom from "https://cdn.skypack.dev/panzoom/";

const mode = new URLSearchParams(location.search).get("mode");

const initData = [...Array(40)].map(() =>
  [...Array(40)].map(() => {
    return Math.random() >= 0.95;
  })
);

function App() {
  const container$ = useRef();
  const panzoom$ = useRef();
  useEffect(() => {
    const p = Panzoom(container$.current, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: false,
    });

    panzoom$.current = p;

    return () => {
      p.dispose();
    };
  }, [container$]);

  const [data] = useState(initData);

  return html`
    <div
      ref=${container$}
      className=${css`
        width: 1000px;
        height: 1000px;
        background: url(./bg.svg) no-repeat;
        background-size: cover;
        background-position: center;
      `}
    >
      <${DebugGrid}
        className=${css`
          color: rgba(0, 255, 0, 0.4);
        `}
      />

      ${data.flatMap((row, rowI) => {
        return row.map((col, colI) => {
          if (!col) return;

          return html`
            <${Card}
              x=${50 * (colI - 10)}
              y=${50 * (rowI - 10)}
              onMouseDown=${() => {
                panzoom$.current?.pause();
              }}
              onDragStart=${() => {
                panzoom$.current?.pause();
              }}
              onDragEnd=${() => {
                panzoom$.current?.resume();
              }}
            />
          `;
        });
      })}
    </div>
  `;
}

function Card({ x, y, className, style, onDragStart, onDragEnd, ...props }) {
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

function DebugGrid({ className }) {
  const container$ = useRef();
  const [dragging, setDragging] = useState(false);

  return html`
    <div
      ref=${container$}
      onDragOver=${/** @param {DragEvent} e */
      (e) => {
        if (!container$.current) return;

        if (!dragging) {
          setDragging(true);
        }

        const { offsetX, offsetY } = e;
        const snappedX = ((offsetX - (offsetX % 50)) / 50) * 50;
        const snappedY = ((offsetY - (offsetY % 50)) / 50) * 50;

        container$.current.style.backgroundPosition = `${snappedX}px ${snappedY}px`;
      }}
      onDragLeave=${() => {
        setDragging(false);

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
    ></div>
  `;
}

render(html`<${App} />`, document.body);
