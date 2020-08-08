import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { randomId } from "../util"

const db = admin.app().firestore()

const FAILED = Symbol("FAILED")

type Body = {
  type?: string
}

/**
  @example
  POST https://region-project.cloudfunctions.net/games

  {
    "type": "shinkei-suijaku"
  }
 */
export const games = functions
  .region(functions.config().functions?.region ?? "us-central1")
  .https.onCall(async (body: Body | undefined, context) => {
    const genData = await import(`../data/${body?.type}`)
      .then(m => m.default)
      .catch(() => FAILED)

    // TODO functions.https.HttpsError を使ってエラー報告
    if (genData === FAILED) {
      return {
        error: true,
        type: "game-type-unknown",
        payload: {
          message: "The game type is unknown",
          type: body?.type ?? "",
          availableTypes: ["shinkei-suijaku"],
        },
      }
    }

    const bulkWriter = (db as any).bulkWriter() as BulkWriter

    const gameId = randomId()
    const gameRef = db.collection("games").doc(gameId)

    const createGame$ = bulkWriter.create(gameRef, {})

    await bulkWriter.flush()

    // TODO functions.https.HttpsError を使ってエラー報告
    const created = await createGame$.catch(() => FAILED)
    if (created === FAILED) {
      return {
        error: true,
        type: "resource-already-exists",
        payload: {
          message: "The resource already exists",
          collection: `games/${gameId}`,
        },
      }
    }

    const data = genData()

    Object.entries(data).forEach(([subPath, docs]) => {
      Object.entries(docs as any).forEach(([key, data]) => {
        bulkWriter.create(gameRef.collection(subPath).doc(key), data)
      })
    })

    await bulkWriter.close()

    return {
      type: "game-created",
      payload: {
        message: "A game created",
        collections: Object.keys(data).map(subPath => {
          return `games/${gameId}/${subPath}`
        }),
      },
    }
  })

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
