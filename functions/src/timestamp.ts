import * as admin from "firebase-admin"

/**
 * createdAt を返す。そのときには updatedAt も必要なので、updatedAt も返す。
 */
export function createdAt() {
  return {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
}

/**
 * updatedAt だけを返す。
 */
export function updatedAt() {
  return {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
}
