import React, { useMemo } from "https://cdn.skypack.dev/react"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "https://cdn.skypack.dev/react-router-dom"
import { createStore } from "https://cdn.skypack.dev/redux"
import { AuthGuard, AuthRedirect, AuthWatcher } from "./auth.js"
import { Game } from "./Game.js"
import { Home } from "./Home.js"
import {
  PortalChildrenContainer,
  Provider as PortalProvider,
} from "./Portal.js"
import { reducer } from "./reducer.js"

export function App() {
  const store = useMemo(
    () =>
      createStore(reducer, undefined, self.__REDUX_DEVTOOLS_EXTENSION__?.()),
    [],
  )

  return (
    <ReduxProvider store={store}>
      <AuthWatcher />

      <PortalProvider>
        <Router>
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <AuthRedirect>
                  <Home />
                </AuthRedirect>
              )}
            />

            <Route
              path="/games/:id"
              render={({
                match: {
                  params: { id },
                },
              }) => (
                <AuthGuard>
                  <Game id={id} />
                </AuthGuard>
              )}
            />

            {/* fallback */}
            <Route render={() => <NotFound />} />
          </Switch>
        </Router>

        <PortalChildrenContainer
          style={{
            position: "fixed",
            top: 0,
            left: 0,
          }}
        />
      </PortalProvider>
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
