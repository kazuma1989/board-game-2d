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
              onDrop=${() => {
                setDraggingIndex({ col: -1, row: -1 });
                panzoom$.current?.resume();

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
