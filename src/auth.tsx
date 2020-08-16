import React, {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/react"
import { useDispatch, useSelector } from "https://cdn.skypack.dev/react-redux"
import { Redirect } from "https://cdn.skypack.dev/react-router-dom"
import { useDexie } from "./dexie.js"
import { auth } from "./firebase.js"

/**
 * 認証状態の変化をリッスンして Store に通知する
 */
export function AuthListener() {
  const dispatch = useDispatch()
  const dexie = useDexie()

  useEffect(() => {
    dispatch({
      type: "Auth.SignIn.Start",
    })

    dexie
      .table("config")
      .put({
        key: "auth",
        value: "aaaa",
      })
      .then(async () => {
        console.log(await dexie.table("config").get("auth"))
      })

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
  }, [dispatch])

  return null
}

/**
 * 認証済みでないときは指定の URL へリダイレクトする
 */
export function AuthGuard({
  redirectTo,
  indeterminate,
  children,
}: {
  redirectTo: string
  indeterminate?: React.ReactNode
  children?: React.ReactNode
}) {
  const authState = useSelector(state => state.user.auth)

  switch (authState) {
    case "INITIAL":
    case "CHECKING": {
      return <>{indeterminate}</>
    }

    case "SIGNED_IN": {
      return <>{children}</>
    }

    default: {
      const search = new URLSearchParams(location.search)
      search.set("redirect", location.pathname)

      return (
        <Redirect
          to={{
            pathname: redirectTo,
            search: search.toString(),
            hash: location.hash,
          }}
        />
      )
    }
  }
}

/**
 * Firebase Auth のリダイレクト認証フローから帰ってきた直後に
 * ?redirect=xxx で指定された URL へ遷移する
 */
export function AuthRedirect({
  redirectToDefault,
  children,
}: {
  redirectToDefault: string
  children?: React.ReactNode
}) {
  const pathnameDefault$ = useRef(redirectToDefault)
  useEffect(() => {
    pathnameDefault$.current = redirectToDefault
  })

  const [redirectTo, setRedirectTo] = useState<{
    pathname: string
    search: string
    hash: string
  }>()

  useEffect(() => {
    auth()
      .getRedirectResult()
      .then(e => {
        if (!e.user) {
          setRedirectTo(undefined)

          return
        }

        const search = new URLSearchParams(location.search)
        const redirect = search.get("redirect")
        if (redirect) {
          search.delete("redirect")

          setRedirectTo({
            pathname: redirect,
            search: search.toString(),
            hash: location.hash,
          })
        } else {
          setRedirectTo({
            pathname: pathnameDefault$.current,
            search: location.search,
            hash: location.hash,
          })
        }
      })
  }, [])

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return <>{children}</>
}
