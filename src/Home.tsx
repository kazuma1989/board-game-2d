import React from "https://cdn.skypack.dev/react"
import { Link } from "https://cdn.skypack.dev/react-router-dom"

export function Home() {
  return (
    <article>
      <h1>Board Game 2D</h1>

      <p>
        <Link
          to={{
            pathname: "/games/xxx",
            search: location.search,
            hash: location.hash,
          }}
        >
          ゲーム開始
        </Link>
      </p>
    </article>
  )
}
