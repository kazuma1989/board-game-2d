import React, { useMemo } from "https://cdn.skypack.dev/react"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import { createStore } from "https://cdn.skypack.dev/redux"
import { Board } from "./Board.js"
import { firestore } from "./firebase.js"
import { FirestorePiles } from "./FirestorePiles.js"
import { Header } from "./Header.js"
import { data } from "./mode.js"
import { Provider as PilesProvider } from "./piles.js"
import { reducer } from "./reducer.js"

export function App() {
  const pilesRef = useMemo(() => {
    const db = firestore()

    if (data === "mock") {
      db.settings({
        host: "localhost:5002",
        ssl: false,
      })
    }

    return db.collection("/games/1xNV05bl2ISPqgCjSQTq/piles")
  }, [])

  const store = useMemo(
    () =>
      createStore(reducer, undefined, self.__REDUX_DEVTOOLS_EXTENSION__?.()),
    [],
  )

  return (
    <PilesProvider value={pilesRef}>
      <ReduxProvider store={store}>
        <FirestorePiles />

        <Header />

        <Board />
      </ReduxProvider>
    </PilesProvider>
  )
}
