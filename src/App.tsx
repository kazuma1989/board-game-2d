import React, { useMemo } from "https://cdn.skypack.dev/react"
import { Provider as ReduxProvider } from "https://cdn.skypack.dev/react-redux"
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "https://cdn.skypack.dev/react-router-dom"
import { createStore } from "https://cdn.skypack.dev/redux"
import { AuthListener, AuthRedirect, useAuthLoaded } from "./auth.js"
import { DebugMenu } from "./DebugMenu.js"
import { Provider as DexieProvider } from "./dexie.js"
import { Game } from "./Game.js"
import { Home } from "./Home.js"
import { Loading } from "./Loading.js"
import { mode } from "./mode.js"
import { NotFound } from "./NotFound.js"
import {
  PortalChildrenContainer,
  Provider as PortalProvider,
} from "./Portal.js"
import { reducer } from "./reducer.js"
import { SignIn } from "./SignIn.js"

export function App() {
  const store = useMemo(
    () =>
      createStore(reducer, undefined, self.__REDUX_DEVTOOLS_EXTENSION__?.()),
    [],
  )

  return (
    <ReduxProvider store={store}>
      <DexieProvider dbName="App">
        <AuthListener />

        <PortalProvider>
          <Router>
            {mode === "debug" && <DebugMenu />}

            <SwitchPages />
          </Router>

          <PortalChildrenContainer
            style={{
              position: "fixed",
              top: 0,
              left: 0,
            }}
          />
        </PortalProvider>
      </DexieProvider>
    </ReduxProvider>
  )
}

function SwitchPages() {
  const loaded = useAuthLoaded()
  if (!loaded) {
    return <Loading />
  }

  return (
    <Switch>
      <Route exact path="/" render={() => <Home />} />

      <Route
        path="/sign-in"
        render={() => (
          <AuthRedirect redirectToDefault="/">
            <SignIn />
          </AuthRedirect>
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
  )
}
