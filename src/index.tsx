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

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <bg2d-loading></bg2d-loading>
    </div>
  )
}

render(
  <ErrorBoundary>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </ErrorBoundary>,
  document.getElementById("app"),
)
