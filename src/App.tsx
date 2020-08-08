import React, {
  useEffect,
  useMemo,
  useState,
} from "https://cdn.skypack.dev/react"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import { createStore } from "https://cdn.skypack.dev/redux"
import { Board } from "./Board.js"
import { app, firestore } from "./firebase.js"
import { FirestorePiles } from "./FirestorePiles.js"
import { Header } from "./Header.js"
import { data } from "./mode.js"
import { Provider as PilesProvider } from "./piles.js"
import { reducer } from "./reducer.js"

if (data === "mock") {
  firestore().settings({
    host: "localhost:5002",
    ssl: false,
  })

  app()
    .functions("asia-northeast1")
    .useFunctionsEmulator("http://localhost:5001")
}

export function App() {
  const store = useMemo(
    () =>
      createStore(reducer, undefined, self.__REDUX_DEVTOOLS_EXTENSION__?.()),
    [],
  )

  // TODO おそらく素直に ReduxProvider の配下に置いたほうがやりやすい
  const [collection, setCollection] = useState("")
  useEffect(() => {
    return store.subscribe(() => {
      const state: any = store.getState()

      setCollection(state.game.collection)
    })
  }, [store])

  const pilesRef = useMemo(
    () => firestore().collection(collection || "games/xxxx/piles"),
    [collection],
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
