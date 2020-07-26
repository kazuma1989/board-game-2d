// @ts-check
/// <reference path="./typings.d.ts" />

import {
  html,
  render,
  useRef,
  useEffect,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";
import { css, cx } from "https://cdn.skypack.dev/emotion";
import panzoom from "https://cdn.skypack.dev/panzoom/";

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
          color: silver;
        `}
      />

      <${Card} x=${50} y=${50} />
      <${Card} x=${100} y=${50} />
      <${Card} x=${150} y=${50} />
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
          width: 100%;
          height: 100%;
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
