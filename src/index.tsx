import React from "https://cdn.skypack.dev/react"
import { render } from "https://cdn.skypack.dev/react-dom"
import { Provider } from "https://cdn.skypack.dev/react-redux"
import { createStore } from "https://cdn.skypack.dev/redux"
import { App } from "./App.js"
import { reducer } from "./reducer.js"

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
