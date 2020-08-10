import { css } from "https://cdn.skypack.dev/emotion"
import React, {
  useEffect,
  useMemo,
  useState,
} from "https://cdn.skypack.dev/react"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import { createStore } from "https://cdn.skypack.dev/redux"
import { Board } from "./Board.js"
import { firestore } from "./firebase.js"
import { FirestorePiles } from "./FirestorePiles.js"
import { Header } from "./Header.js"
import { Provider as PilesProvider } from "./piles.js"
import { reducer } from "./reducer.js"

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

  // FIXME 場当たり的な実装
  // 画面遷移とセットで整理すること
  useEffect(() => {
    if (!collection) return

    history.pushState(null, "", "/" + collection + location.search)
  }, [collection])

  const pilesRef = useMemo(
    () =>
      firestore().collection(
        collection || location.pathname.slice(1) || "games/xxx/piles",
      ),
    [collection],
  )

  return (
    <PilesProvider value={pilesRef}>
      <ReduxProvider store={store}>
        <FirestorePiles />

        <View />
      </ReduxProvider>
    </PilesProvider>
  )
}

function View() {
  return (
    <div
      className={css`
        display: contents;
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      `}
    >
      <Header />

      <Board />
    </div>
  )
}
