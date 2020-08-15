import * as admin from "firebase-admin"
import { functions } from "../functions"
import { createdAt, updatedAt } from "../timestamp"

const db = admin.app().firestore()

/**
 * Firebase Auth にユーザーを作成したら Firestore にも document を作成する
 */
export const userCreate = functions.auth
  .user()
  .onCreate(async ({ uid, displayName, photoURL }) => {
    await db
      .collection("users")
      .doc(uid)
      .set({
        displayName,
        photoURL,
        ...createdAt(),
      })
  })

/**
 * Firebase Auth からユーザーを削除したら Firestore にも反映する
 */
export const userDelete = functions.auth.user().onDelete(async ({ uid }) => {
  await db.collection("users").doc(uid).delete()
})

/**
 * Game を作成したらオーナーユーザーにもその情報を持たせる
 */
export const userOwnerGamesCreate = functions.firestore
  .document("games/{gameId}")
  .onCreate(async game$ => {
    const { id: gameId } = game$
    const { owner } = game$.data()

    const ownerRef = db.collection("users").doc(owner)

    await ownerRef.update({
      ...updatedAt(),
    })

    await ownerRef
      .collection("ownerGames")
      .doc(gameId)
      .set({
        owner,
        ...createdAt(),
      })
  })

/**
 * Game を削除したらオーナーユーザーからも消しておく
 */
export const userOwnerGamesDelete = functions.firestore
  .document("games/{gameId}")
  .onDelete(async game$ => {
    const { id: gameId } = game$
    const { owner } = game$.data()

    const ownerRef = db.collection("users").doc(owner)

    await ownerRef.update({
      ...updatedAt(),
    })

    await ownerRef.collection("ownerGames").doc(gameId).delete()
  })
