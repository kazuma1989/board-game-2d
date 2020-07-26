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
import panzoom from "https://cdn.skypack.dev/panzoom/";

const initData = [...Array(40)].map(() => [...Array(40)]);

function App() {
  const container$ = useRef();
  useEffect(() => {
    const p = panzoom(container$.current, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: false,
    });

    return () => {
      p.dispose();
    };
  }, [container$.current]);

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
      ${data.flatMap((row, rowI) => {
        return row.map((col, colI) => {
          return html`<${Card} x=${50 * (colI - 10)} y=${50 * (rowI - 10)} />`;
        });
      })}

      <${DebugGrid}
        className=${css`
          color: lime;
        `}
      />
    </div>
  `;
}

function Card({ x, y }) {
  return html`
    <div
      className=${css`
        border: solid 1px gray;
        width: 50px;
        height: 70px;
        position: absolute;
        box-shadow: 0px 1px 5px;
        background-color: white;
      `}
      style=${{
        left: x,
        top: y,
      }}
    >
      Card
    </div>
  `;
}

function DebugGrid({ className }) {
  return html`
    <div
      className=${cx(
        css`
          pointer-events: none;
          position: relative;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
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
        className
      )}
    ></div>
  `;
}

render(html`<${App} />`, document.body);
