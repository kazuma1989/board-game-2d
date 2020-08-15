import * as admin from "firebase-admin"
import * as functions from "firebase-functions"
import { randomId } from "../util"

const db = admin.app().firestore()

type Body = {
  type?: string
}

/**
  @example
  const { data } = await functions.httpsCallable("games")({
    type: "speed",
  })
 */
export const games = functions
  .region(functions.config().functions?.region ?? "us-central1")
  .https.onCall(async (body: Body | undefined, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      )
    }

    const genData = await import(`../data/${body?.type}`)
      .then(m => m.default as () => object)
      .catch(() => {
        throw new functions.https.HttpsError(
          "unimplemented",
          `Unknown game type: "${body?.type}"`,
          {
            type: body?.type,
          },
        )
      })

    const bulkWriter = (db as any).bulkWriter() as BulkWriter

    const gameId = randomId()
    const gameRef = db.collection("games").doc(gameId)

    const createGame$ = bulkWriter.create(gameRef, {
      owner: context.auth.uid,
      players: [],
      applicants: [],
    })

    await bulkWriter.flush()

    await createGame$.catch(() => {
      throw new functions.https.HttpsError(
        "already-exists",
        `A game already exists. Id: ${gameId}`,
        {
          gameId,
          documentPath: `games/${gameId}`,
        },
      )
    })

    const data = genData()

    Object.entries(data).forEach(([subPath, docs]) => {
      Object.entries(docs as any).forEach(([key, data]) => {
        bulkWriter.create(gameRef.collection(subPath).doc(key), data)
      })
    })

    await bulkWriter.close()

    return {
      code: "game-created",
      message: "A new game created",
      details: {
        gameId,
        documentPath: `games/${gameId}`,
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
