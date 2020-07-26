// @ts-check
/// <reference path="./typings.d.ts" />

import { css } from "https://cdn.skypack.dev/emotion";
import {
  html,
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/htm/preact/standalone.module.js";
import produce from "https://cdn.skypack.dev/immer";
import Panzoom from "https://cdn.skypack.dev/panzoom/";
import { Card } from "./Card.js";
import { Grid } from "./Grid.js";
import { mode } from "./mode.js";

export function App() {
  mode === "debug" && console.count("render App");

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

  const [cards, setCards] = useState(initData);
  const [draggingIndex, setDraggingIndex] = useState({ col: -1, row: -1 });

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
      <${Grid}
        onDrop=${(dest) => {
          const { row, col } = draggingIndex;
          if (row === -1 || col === -1) return;

          setCards(
            produce((cards) => {
              cards[row][col] = false;
              cards[dest.row][dest.col] = true;
            })
          );
        }}
        className=${css`
          color: rgba(0, 255, 0, 0.4);
        `}
      />

      ${cards.flatMap((rowData, row) => {
        return rowData.map((colData, col) => {
          if (!colData) return;

          return html`
            <${Card}
              x=${50 * (col - 10)}
              y=${50 * (row - 10)}
              onMouseDown=${() => {
                panzoom$.current?.pause();
              }}
              onDragStart=${() => {
                setDraggingIndex({ col, row });
                panzoom$.current?.pause();
              }}
              onDragEnd=${() => {
                setDraggingIndex({ col: -1, row: -1 });
                panzoom$.current?.resume();
              }}
            />
          `;
        });
      })}
    </div>
  `;
}

const initData = [...Array(40)].map(() =>
  [...Array(40)].map(() => {
    return Math.random() >= 0.95;
  })
);
