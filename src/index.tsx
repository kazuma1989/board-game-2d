import React, { Suspense } from "https://cdn.skypack.dev/react"
import { render } from "https://cdn.skypack.dev/react-dom"

const App = React.lazy(() =>
  import("./App.js").then(({ App }) => ({ default: App })),
)

render(
  <Suspense fallback={<div>Loading...</div>}>
    <App />
  </Suspense>,
  document.body,
)
