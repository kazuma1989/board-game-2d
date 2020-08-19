import React from "https://cdn.skypack.dev/react"
import { render } from "https://cdn.skypack.dev/react-dom"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import { createStore } from "https://cdn.skypack.dev/redux"
import { App } from "./App.js"
import { Provider as DexieProvider } from "./dexie.js"
import { ErrorBoundary } from "./ErrorBoundary.js"
import { firestore, functions } from "./firebase.js"
import { data } from "./mode.js"
import { Provider as PortalProvider } from "./Portal.js"
import { reducer } from "./reducer.js"

if (data === "mock") {
  console.log("Using emulators: firestore, functions")

  firestore().settings({
    host: "localhost:5002",
    ssl: false,
  })

  functions.useFunctionsEmulator("http://localhost:5001")
}

const store = createStore(
  reducer,
  undefined,
  self.__REDUX_DEVTOOLS_EXTENSION__?.(),
)

render(
  <ErrorBoundary>
    <PortalProvider>
      <ReduxProvider store={store}>
        <DexieProvider dbName="App">
          <App />
        </DexieProvider>
      </ReduxProvider>
    </PortalProvider>
  </ErrorBoundary>,
  document.getElementById("app"),
)
