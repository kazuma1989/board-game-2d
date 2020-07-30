import React from "https://cdn.skypack.dev/react"
import { render } from "https://cdn.skypack.dev/react-dom"
import { Provider } from "https://cdn.skypack.dev/react-redux"
import { createStore } from "https://cdn.skypack.dev/redux"
import { App } from "./App.js"
import * as firebase from "./firebase.js"
import { reducer } from "./reducer.js"

try {
  const app = firebase.app()
  const features = ["auth", "firestore", "messaging", "storage"].filter(
    feature => typeof app[feature] === "function",
  )

  console.log(`Firebase SDK loaded with ${features.join(", ")}`)
} catch (e) {
  console.error(e)
  console.error("Error loading the Firebase SDK, check the console.")
}

const store = createStore(
  reducer,
  undefined,
  self.__REDUX_DEVTOOLS_EXTENSION__?.(),
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.body,
)
