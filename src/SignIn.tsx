import { css, cx } from "https://cdn.skypack.dev/emotion"
import React, { useEffect, useState } from "https://cdn.skypack.dev/react"
import { useSelector } from "https://cdn.skypack.dev/react-redux"
import { Redirect } from "https://cdn.skypack.dev/react-router-dom"
import { auth } from "./firebase.js"

export function SignIn() {
  const [afterRedirect, setAfterRedirect] = useState(false)

  useEffect(() => {
    auth()
      .getRedirectResult()
      .then(e => {
        setAfterRedirect(Boolean(e.user))
      })
  }, [])

  const authState = useSelector(state => state.user.auth)

  if (afterRedirect && authState === "SIGNED_IN") {
    return (
      <Redirect
        to={{
          pathname: "/",
          search: location.search,
          hash: location.hash,
        }}
      />
    )
  }

  return (
    <article>
      <h1>Board Game 2D</h1>

      {authState === "CHECKING" ? (
        <>
          <p>サインイン中・・・</p>

          <p
            className={css`
              text-align: center;
            `}
          >
            <bg2d-loading />
          </p>
        </>
      ) : (
        <>
          <p>サインインしてください。</p>

          <p>
            <ButtonWithImage
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              onClick={() => {
                const provider = new auth.GoogleAuthProvider()

                auth().signInWithRedirect(provider)
              }}
            >
              Sign in with Google
            </ButtonWithImage>
          </p>
        </>
      )}
    </article>
  )
}

function ButtonWithImage({
  src,
  className,
  ...props
}: {
  src: string
  onClick?(): void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={cx(
        css`
          padding: 8px 16px;
          height: auto;

          ::before {
            content: "";
            display: inline-block;
            vertical-align: bottom;
            width: 20px;
            height: 20px;
            margin-right: 8px;
            background-image: url(${src});
            background-size: contain;
          }
        `,
        className,
      )}
      {...props}
    ></button>
  )
}
