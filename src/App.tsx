import { css } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useMemo } from "https://cdn.skypack.dev/react"
import {
  Provider as ReduxProvider,
  useDispatch,
  useSelector,
} from "https://cdn.skypack.dev/react-redux"
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "https://cdn.skypack.dev/react-router-dom"
import { createStore } from "https://cdn.skypack.dev/redux"
import { Board } from "./Board.js"
import { firestore } from "./firebase.js"
import { FirestorePiles } from "./FirestorePiles.js"
import { Header } from "./Header.js"
import { Provider as _PilesProvider } from "./piles.js"
import { reducer } from "./reducer.js"

export function App() {
  const store = useMemo(
    () =>
      createStore(reducer, undefined, self.__REDUX_DEVTOOLS_EXTENSION__?.()),
    [],
  )

  return (
    <Router>
      <ReduxProvider store={store}>
        <PilesProvider>
          <FirestorePiles />

          <Switch>
            <Route exact path="/" render={() => <Header />} />
            <Route
              path="/games/:id"
              render={({ id }) => <View gameId={id} />}
            />

            <Route render={() => <NotFound />} />
          </Switch>
        </PilesProvider>
      </ReduxProvider>
    </Router>
  )
}

function PilesProvider({ children }: { children?: React.ReactNode }) {
  const dispatch = useDispatch()
  const location = useLocation()
  useEffect(() => {
    dispatch({
      type: "Game.Created",
      payload: {
        // FIXME 絶妙に collection の扱いがばらばらなのを整理する
        collection: `${location.pathname}/piles`,
      },
    })
  }, [location])

  const collection = useSelector(state => state.game.collection)
  const pilesRef = useMemo(
    () =>
      firestore().collection(
        collection || location.pathname.slice(1) + "/piles",
      ),
    [collection],
  )

  return <_PilesProvider value={pilesRef}>{children}</_PilesProvider>
}

function View({ gameId }: { gameId: string }) {
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

function NotFound() {
  return (
    <article>
      <h2>404 Not Found</h2>
    </article>
  )
}
