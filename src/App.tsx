import React, { useMemo, useState } from "https://cdn.skypack.dev/react"
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
import {
  Portal,
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
      <PortalProvider>
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
  const [v, setV] = useState(false)

  return (
    <article>
      <h2>404 Not Found</h2>

      <p>
        <button
          type="button"
          onClick={() => {
            setV(v => !v)
          }}
        >
          Toggle
        </button>
      </p>

      <Portal>
        {v && (
          <ContextMenu
            onOutsideClick={() => {
              setV(false)
            }}
            style={{
              transform: `translate(100px, 100px)`,
            }}
          >
            <ContextMenu.Item>Menu 1</ContextMenu.Item>
            <ContextMenu.Item>Menu 2</ContextMenu.Item>
            <ContextMenu.Item>Menu 3</ContextMenu.Item>
            <ContextMenu.Item>Menu 4</ContextMenu.Item>
          </ContextMenu>
        )}
      </Portal>
    </article>
  )
}
