import type { Store } from "redux"
import * as firebase from "./firebase.js"
import type { Action, State } from "./reducer"

export function firestoreMiddleware(store: Store<State, Action>) {
  const db = firebase.firestore()
  const pilesRef = db.collection("/games/1xNV05bl2ISPqgCjSQTq/piles")

  const sync = async (state: State, action: Action): Promise<void> => {
    switch (action.type) {
      case "Pile.DragStart": {
        const { pileId } = action.payload
        const pileRef = pilesRef.doc(pileId)

        await db.runTransaction(async t => {
          const pile$ = await t.get(pileRef)
          if (pile$.data()?.dragging) {
            throw "locked"
          }

          t.update(pileRef, {
            dragging: state.user.id,
          })
        })

        return
      }
    }
  }

  return <T>(next: (action: Action) => T) => async (
    action: Action,
  ): Promise<T | void> => {
    try {
      await sync(store.getState(), action)

      return next(action)
    } catch (e) {
      console.warn(e)
    }
  }
}
