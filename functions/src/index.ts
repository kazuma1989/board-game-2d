import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

const app = admin.initializeApp()
const db = app.firestore()

export const setupGame = functions.https.onRequest(async (req, resp) => {
  await db.collection("games").doc("1xNV05bl2ISPqgCjSQTq").create({})

  resp.send("Hello from Firebase!")
})
