/// <reference types="firebase" />

import "/__/firebase/7.17.2/firebase-app.js"
import "/__/firebase/7.17.2/firebase-auth.js"
import "/__/firebase/7.17.2/firebase-firestore.js"
import "/__/firebase/7.17.2/firebase-functions.js"
import "/__/firebase/7.17.2/firebase-storage.js"
import "/__/firebase/init.js"

const app = self.firebase.app

export const auth = self.firebase.auth
export const firestore = self.firebase.firestore
export const functions = app().functions("asia-northeast1")
export const storage = self.firebase.storage
