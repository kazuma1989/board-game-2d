import React, {
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/react"
import { useDispatch, useSelector } from "https://cdn.skypack.dev/react-redux"
import { Redirect } from "https://cdn.skypack.dev/react-router-dom"
import { useDexie } from "./dexie.js"
import { auth } from "./firebase.js"
import { randomId } from "./util.js"

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

    return auth().onAuthStateChanged(async user => {
      if (user) {
        dispatch({
          type: "Auth.SignIn",
          payload: {
            userId: user.uid,
          },
        })

        await dexie.table("config").delete("auth")

        return
      }

      dispatch({
        type: "Auth.SignOut",
      })

      // サインインしていない状態だったら、IndexedDB 内の userId を持ってきて匿名サインイン状態にする。
      // ブラウザーを閉じても userId を保つのがいろいろ都合がよいので。
      let entry = await dexie.table("config").get("auth")
      if (!entry) {
        entry = {
          key: "auth",
          value: randomId(),
        }

        await dexie.table("config").put(entry)
      }

      dispatch({
        type: "Auth.SignIn",
        payload: {
          userId: entry.value,
        },
      })
    })
  }, [dispatch])

  return null
}

/**
 * 認証情報を読み込めたら true を返す
 */
export function useAuthLoaded() {
  const loaded = useSelector(state => Boolean(state.user.id))

  return loaded
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
