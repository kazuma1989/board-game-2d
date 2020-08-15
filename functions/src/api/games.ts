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
    // 認証チェック
    if (!auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      )
    }

    const ownerRef = db.collection("users").doc(auth.uid)

    const genData = await db.runTransaction(async t => {
      const owner = await t.get(ownerRef).then(d => d.data())

      // ここに来るのは、Auth と Firestore の連携ミス
      if (!owner) {
        throw new functions.https.HttpsError(
          "internal",
          `User data not found: ${ownerRef.id}`,
          {
            userId: ownerRef.id,
          },
        )
      }

      // 作成の最大数を超えていないかチェック
      const MAX_COUNT = 3
      const { ownerGamesCount = 0 } = owner
      if (ownerGamesCount >= MAX_COUNT) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          `Exceeded max games: ${MAX_COUNT}`,
          {
            currentCount: ownerGamesCount,
            maxCount: MAX_COUNT,
          },
        )
      }

      t.update(ownerRef, {
        ownerGamesCount: ownerGamesCount + 1,
      })

      // type が対応可能なものかチェックする
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

      return genData
    })

    // 新しい Game doc を生成する
    const gameRef = await db.collection("games").add({
      owner: ownerRef.id,
      players: [],
    })

    // User のサブコレクションを更新する
    await ownerRef.collection("ownerGames").doc(gameRef.id).set({
      owner: ownerRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    const bw = db.bulkWriter()

    // Game データを用意する
    const data = genData()
    Object.entries(data).forEach(([subPath, docs]) => {
      Object.entries(docs as any).forEach(([key, data]) => {
        bw.create(gameRef.collection(subPath).doc(key), data as any)
      })
    })

    await bw.close()

    const gameId = gameRef.id

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
