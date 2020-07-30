import type { Store } from "redux"
import type { Action, State } from "./reducer"

export function firestoreMiddleware(store: Store<State, Action>) {
  return (next: Function) => (action: Action) => {
    console.debug(store.getState())
    next(action)
    console.debug(store.getState())
  }
}
