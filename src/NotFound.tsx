import React from "https://cdn.skypack.dev/react"
import { Link } from "https://cdn.skypack.dev/react-router-dom"

export function NotFound() {
  return (
    <article>
      <h2>404 Not Found</h2>

      <p>
        <Link
          to={{
            pathname: "/",
            search: location.search,
            hash: location.hash,
          }}
        >
          Go to top
        </Link>
      </p>
    </article>
  )
}
