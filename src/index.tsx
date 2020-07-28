import React, { render } from "https://cdn.skypack.dev/preact/compat"
import { App } from "./App.js"
import { mode } from "./mode.js"

if (mode === "debug") {
  import("https://cdn.skypack.dev/preact/debug")
}

render(<App />, document.body)
