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
import { Grid } from "./Grid.js";
import { Pile } from "./Pile.js";

export function App() {
  const container$ = useRef();
  useEffect(() => {
    const container = container$.current;
    if (!container) return;

    const p = Panzoom(container, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: false,
      zoomDoubleClickSpeed: 2.5,

      /**
       * @param {MouseEvent} e
       * @returns {boolean | undefined} should ignore
       */
      beforeMouseDown(e) {
        if (e.shiftKey) {
          return true;
        }

        // @ts-ignore
        if (!("pannable" in e.target.dataset)) {
          return true;
        }
      },
    });

    return () => {
      p.dispose();
    };
  }, [container$]);

  const [piles, setPiles] = useState(initPiles);
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
      data-pannable
    >
      <${Grid}
        onDrop=${(dest) => {
          const { row, col } = draggingIndex;
          if (row === -1 || col === -1) return;
          if (row === dest.row && col === dest.col) return;

          setPiles(
            produce((piles) => {
              piles[dest.row][dest.col] = piles[row][col];
              piles[row][col] = null;
            })
          );
        }}
        className=${css`
          color: rgba(0, 255, 0, 0.4);
        `}
        data-pannable
      />

      ${piles.flatMap((rowPiles, row) => {
        return rowPiles.map((pile, col) => {
          if (!pile) return;

          const dest = {
            row,
            col,
          };

          return html`
            <${Pile}
              cards=${pile.cards}
              x=${50 * (col - 10)}
              y=${50 * (row - 10)}
              onDragStart=${() => {
                setDraggingIndex({ col, row });
              }}
              onDragEnd=${() => {
                setDraggingIndex({ col: -1, row: -1 });
              }}
              onDrop=${() => {
                setDraggingIndex({ col: -1, row: -1 });

                const { row, col } = draggingIndex;
                if (row === -1 || col === -1) return;
                if (row === dest.row && col === dest.col) return;

                setPiles(
                  produce((piles) => {
                    piles[dest.row][dest.col].cards.push(
                      ...piles[row][col].cards
                    );
                    piles[row][col] = null;
                  })
                );
              }}
            />
          `;
        });
      })}
    </div>
  `;
}

const initPiles = [...Array(40)].map(() =>
  [...Array(40)].map(() => {
    const pile = {
      cards: [{ text: "card" }],
    };

    return Math.random() >= 0.95 ? pile : null;
  })
);
