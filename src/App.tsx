import React from "https://cdn.skypack.dev/react"
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "https://cdn.skypack.dev/react-router-dom"
import { AuthListener, AuthRedirect, useAuthLoaded } from "./auth.js"
import { DebugMenu } from "./DebugMenu.js"
import { Game } from "./Game.js"
import { Home } from "./Home.js"
import { Loading } from "./Loading.js"
import { mode } from "./mode.js"
import { NotFound } from "./NotFound.js"
import { PortalChildrenContainer } from "./Portal.js"
import { SignIn } from "./SignIn.js"

export function App() {
  return (
    <>
      <AuthListener />

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
    </>
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
