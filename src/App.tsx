import React, { useMemo } from "https://cdn.skypack.dev/react"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "https://cdn.skypack.dev/react-router-dom"
import { createStore } from "https://cdn.skypack.dev/redux"
import { ContextMenu } from "./ContextMenu.js"
import { Game } from "./Game.js"
import { Header } from "./Header.js"
import { reducer } from "./reducer.js"

export function App() {
  const store = useMemo(
    () =>
      createStore(reducer, undefined, self.__REDUX_DEVTOOLS_EXTENSION__?.()),
    [],
  )

  return (
    <ReduxProvider store={store}>
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <div>
                <Header />

                <article>
                  <h1>Board Game 2D</h1>
                </article>
              </div>
            )}
          />
          <Route
            path="/games/:id"
            render={({
              match: {
                params: { id },
              },
            }) => <Game id={id} />}
          />

          {/* fallback */}
          <Route render={() => <NotFound />} />
        </Switch>

        <ContextMenu />
      </Router>
    </ReduxProvider>
  )
}

function NotFound() {
  return (
    <article>
      <h2>404 Not Found</h2>
    </article>
  )
}
