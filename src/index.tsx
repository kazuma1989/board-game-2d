import React, { Suspense } from "https://cdn.skypack.dev/react"
import { render } from "https://cdn.skypack.dev/react-dom"
import { ErrorBoundary } from "./ErrorBoundary.js"

const App = React.lazy(() =>
  Promise.all([import("./App.js"), import("./init-app.js")]).then(
    ([{ App }]) => ({
      default: App,
    }),
  ),
)

render(
  <ErrorBoundary>
    <Suspense
      fallback={
        <article>
          <h3>Loading...</h3>
        </article>
      }
    >
      <App />
    </Suspense>
  </ErrorBoundary>,
  document.body,
)
