import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

const db = admin.app().firestore()

/**
 * Firebase Auth にユーザーを作成したら Firestore にも document を作成する
 */
export const userCreate = functions
  .region(functions.config().functions?.region ?? "us-central1")
  .auth.user()
  .onCreate(({ uid, displayName, photoURL }) => {
    return db
      .collection("users")
      .doc(uid)
      .set({
        displayName,
        photoURL,
        ...timestamp(),
      })
  })

/**
 * Firebase Auth からユーザーを削除したら Firestore にも反映する
 */
export const userDelete = functions
  .region(functions.config().functions?.region ?? "us-central1")
  .auth.user()
  .onDelete(({ uid }) => {
    return db.collection("users").doc(uid).delete()
  })

/**
 * Game を作成したらオーナーユーザーにもその情報を持たせる
 */
export const userOwnerGamesCreate = functions.firestore
  .document("games/{gameId}")
  .onCreate(game$ => {
    const { id: gameId } = game$
    const { owner } = game$.data()

    return db
      .collection("users")
      .doc(owner)
      .collection("ownerGames")
      .doc(gameId)
      .set({
        owner,
        ...timestamp(),
      })
  })

/**
 * Game を削除したらオーナーユーザーからも消しておく
 */
export const userOwnerGamesDelete = functions.firestore
  .document("games/{gameId}")
  .onDelete(game$ => {
    const { id: gameId } = game$
    const { owner } = game$.data()

    return db
      .collection("users")
      .doc(owner)
      .collection("ownerGames")
      .doc(gameId)
      .delete()
  })

function timestamp() {
  return {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
}
