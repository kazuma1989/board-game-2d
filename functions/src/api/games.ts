import * as admin from "firebase-admin"
import { https } from "firebase-functions"
import { functions } from "../functions"
import { createdAt } from "../timestamp"

const db = admin.app().firestore()
const { HttpsError } = https

type Body = {
  type?: string
}

/**
  @example
  const { data } = await functions.httpsCallable("games")({
    type: "speed",
  })
 */
export const games = functions.https.onCall(
  async (body: Body | undefined, { auth }) => {
    // 認証チェック
    if (!auth) {
      throw new HttpsError(
        "failed-precondition",
        "The function must be called while authenticated.",
      )
    }

    const ownerRef = db.collection("users").doc(auth.uid)

    // 作成の最大数を超えていないかチェック
    const MAX_COUNT = 3
    const games = await ownerRef.collection("ownerGames").listDocuments()
    if (games.length >= MAX_COUNT) {
      throw new HttpsError(
        "resource-exhausted",
        `Exceeded max games: ${MAX_COUNT}`,
        {
          currentCount: games.length,
          maxCount: MAX_COUNT,
        },
      )
    }

    // type が対応可能なものかチェックする
    const genData = await import(`../data/${body?.type}`)
      .then(m => m.default as () => object)
      .catch(() => {
        throw new HttpsError(
          "unimplemented",
          `Unknown game type: "${body?.type}"`,
          {
            type: body?.type,
          },
        )
      })

    // 新しい Game doc を生成する
    const gameRef = await db.collection("games").add({
      owner: ownerRef.id,
      players: [],
      ...createdAt(),
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
  },
)
