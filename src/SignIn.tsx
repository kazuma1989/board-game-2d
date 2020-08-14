import { css, cx } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { useSelector } from "https://cdn.skypack.dev/react-redux"
import { auth } from "./firebase.js"

export function SignIn() {
  const authState = useSelector(state => state.user.auth)

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
      ) : authState === "SIGNED_IN" ? (
        <>
          <p></p>

          <p>
            <Button
              onClick={() => {
                auth().signOut()
              }}
            >
              サインアウトする
            </Button>
          </p>
        </>
      ) : (
        <>
          <p>サインインしてください。</p>

          <p>
            <Button
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              onClick={() => {
                const provider = new auth.GoogleAuthProvider()

                auth().signInWithRedirect(provider)
              }}
            >
              Sign in with Google
            </Button>
          </p>
        </>
      )}
    </article>
  )
}

function Button({
  src,
  className,
  ...props
}: {
  src?: string
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
          text-align: inherit;
        `,
        src &&
          css`
            ::before {
              content: "";
              display: inline-block;
              vertical-align: -0.14em;
              width: 1em;
              height: 1em;
              margin-right: 8px;
              background-image: url(${src});
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
            }
          `,
        className,
      )}
      {...props}
    ></button>
  )
}
