import React, { useEffect } from "https://cdn.skypack.dev/react"
import { useDispatch, useSelector } from "https://cdn.skypack.dev/react-redux"
import { Redirect } from "https://cdn.skypack.dev/react-router-dom"
import { auth } from "./firebase.js"

export function AuthWatcher() {
  const dispatch = useDispatch()

  useEffect(() => {
    return auth().onAuthStateChanged(user => {
      if (user) {
        dispatch({
          type: "Auth.SignIn",
          payload: {
            userId: user.uid,
          },
        })
      } else {
        dispatch({
          type: "Auth.SignOut",
        })
      }
    })
  }, [])

  return null
}

export function AuthGuard({ children }: { children?: React.ReactNode }) {
  const signedIn = useSelector(state => state.user.signedIn)

  if (!signedIn) {
    const search = new URLSearchParams(location.search)
    search.set("redirect", location.pathname)

    return (
      <Redirect
        to={{
          pathname: "/",
          search: search.toString(),
          hash: location.hash,
        }}
      />
    )
  }

  return <>{children}</>
}

export function AuthRedirect({ children }: { children?: React.ReactNode }) {
  const signedIn = useSelector(state => state.user.signedIn)

  const search = new URLSearchParams(location.search)
  if (signedIn && search.has("redirect")) {
    const redirect = search.get("redirect")
    search.delete("redirect")

    return (
      <Redirect
        to={{
          pathname: redirect,
          search: search.toString(),
          hash: location.hash,
        }}
      />
    )
  }

  return <>{children}</>
}
