import { firestore, functions } from "./firebase.js"
import { data } from "./mode.js"

if (data === "mock") {
  console.log("Using emulators: firestore, functions")

  firestore().settings({
    host: "localhost:5002",
    ssl: false,
  })

  functions.useFunctionsEmulator("http://localhost:5001")
}
