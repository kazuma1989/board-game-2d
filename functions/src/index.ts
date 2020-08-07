import * as functions from "firebase-functions"

export const helloWorld = functions.https.onRequest((req, resp) => {
  functions.logger.info("Hello logs!", { structuredData: true })

  resp.send("Hello from Firebase!")
})
