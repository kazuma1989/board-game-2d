import { injectGlobal } from "https://cdn.skypack.dev/emotion"
import { firestore, functions } from "./firebase.js"
import { data } from "./mode.js"

injectGlobal`
  :root {
    /* https://brumm.af/shadows */
    /* 6, 0.07, 100px, 150px, 0px */
    --shadow-wide: 0 2.8px 4.2px rgba(0, 0, 0, 0.02),
      0 6.7px 10px rgba(0, 0, 0, 0.028), 0 12.5px 18.8px rgba(0, 0, 0, 0.035),
      0 22.3px 33.5px rgba(0, 0, 0, 0.042), 0 41.8px 62.7px rgba(0, 0, 0, 0.05),
      0 100px 150px rgba(0, 0, 0, 0.07);
  }
`

if (data === "mock") {
  console.log("Using emulators: firestore, functions")

  firestore().settings({
    host: "localhost:5002",
    ssl: false,
  })

  functions.useFunctionsEmulator("http://localhost:5001")
}
