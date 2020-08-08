import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { randomId } from "./util"

/**
 * @see https://googleapis.dev/nodejs/firestore/latest/BulkWriter.html
 */
type BulkWriter = {
  create(
    ref: FirebaseFirestore.DocumentReference,
    data: any,
  ): Promise<admin.firestore.WriteResult>

  flush(): Promise<void>

  close(): Promise<void>
}

const app = admin.initializeApp()
const db = app.firestore()

const FAILED = Symbol("FAILED")

export const games = functions.https.onRequest(async (req, resp) => {
  if (req.method !== "POST") {
    resp
      .header("Allow", ["POST"].join(", "))
      .status(405)
      .send({
        error: true,
        type: "method-not-allowed",
        payload: {
          message: "Method Not Allowed",
        },
      })

    return
  }

  const bulkWriter = (db as any).bulkWriter() as BulkWriter

  const gameId = randomId()
  const gameRef = db.collection("games").doc(gameId)

  const createGame$ = bulkWriter.create(gameRef, {})

  await bulkWriter.flush()

  const created = await createGame$.catch(err => {
    resp.status(409).send({
      error: true,
      type: "resource-already-exists",
      payload: {
        message: "The resource already exists",
        collection: `games/${gameId}`,
      },
    })

    return FAILED
  })
  if (created === FAILED) return

  const data = await import("data/shinkei-suijaku.json")

  Object.entries(data).forEach(([subPath, docs]) => {
    Object.entries(docs).forEach(([key, data]) => {
      bulkWriter.create(gameRef.collection(subPath).doc(key), data)
    })
  })

  await bulkWriter.close()

  resp.status(201).send({
    type: "game-created",
    payload: {
      message: "A game created",
      collections: Object.keys(data).map(subPath => {
        return `games/${gameId}/${subPath}`
      }),
    },
  })
})
