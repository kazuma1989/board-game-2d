import { css } from "https://cdn.skypack.dev/emotion"
import React from "https://cdn.skypack.dev/react"
import { auth } from "./firebase.js"

export function Home() {
  return (
    <article>
      <h1>Board Game 2D</h1>

      <p>Please sign in.</p>

      <p
        className={css`
          display: flex;
          justify-content: center;
        `}
      >
        <button
          type="button"
          className={css`
            display: flex;
            align-items: center;
            padding: 8px 16px;
            height: auto;
          `}
          onClick={() => {
            const provider = new auth.GoogleAuthProvider()

            auth().signInWithRedirect(provider)
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            width="20"
            height="20"
            className={css`
              float: none;
              display: inline-block;
              margin: 0 8px 0 0;
            `}
          />
          Sign in with Google
        </button>
      </p>
    </article>
  )
}
