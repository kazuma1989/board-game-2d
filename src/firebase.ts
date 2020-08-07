/// <reference types="firebase" />

import "/__/firebase/7.17.1/firebase-app.js"
import "/__/firebase/7.17.1/firebase-auth.js"
import "/__/firebase/7.17.1/firebase-firestore.js"
import "/__/firebase/7.17.1/firebase-storage.js"
import "/__/firebase/init.js"

export const app = self.firebase.app
export const auth = self.firebase.auth
export const firestore = self.firebase.firestore
export const storage = self.firebase.storage