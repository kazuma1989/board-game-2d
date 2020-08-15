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
    return db.collection("users").doc(uid).set({
      displayName,
      photoURL,
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
