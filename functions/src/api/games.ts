import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

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
  .https.onCall(async (body: Body | undefined, { auth }) => {
    if (!auth) {
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

    const owner = auth.uid
    const gameRef = await db.collection("games").add({
      owner,
      players: [],
    })
    const gameId = gameRef.id

    const bw = db.bulkWriter()

    // Game データを用意する
    const data = genData()
    Object.entries(data).forEach(([subPath, docs]) => {
      Object.entries(docs as any).forEach(([key, data]) => {
        bw.create(gameRef.collection(subPath).doc(key), data as any)
      })
    })

    // User のサブコレクションを更新する
    bw.create(
      db.collection("users").doc(owner).collection("ownerGames").doc(gameId),
      {
        owner,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    )

    await bw.close()

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
