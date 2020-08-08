import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import * as data from "data/shinkei-suijaku.json"

const app = admin.initializeApp()
const db = app.firestore()

export const setupGame = functions.https.onRequest(async (req, resp) => {
  // await db.collection("games").doc("1xNV05bl2ISPqgCjSQTq").create({})

  functions.logger.debug(data)

  resp.send("Hello from Firebase!")
})
