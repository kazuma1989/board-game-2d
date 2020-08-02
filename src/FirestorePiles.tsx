import { useEffect } from "https://cdn.skypack.dev/react"
import { useDispatch } from "https://cdn.skypack.dev/react-redux"
import { useCollection } from "./piles.js"

export function FirestorePiles() {
  const dispatch = useDispatch()
  const pilesRef = useCollection()

  useEffect(() => {
    return pilesRef.onSnapshot(pilesSnapshot => {
      pilesSnapshot.docChanges().forEach(change => {
        switch (change.type) {
          case "added":
          case "modified": {
            const pile$ = change.doc

            dispatch({
              type: "Firestore.Set.Pile",
              payload: {
                id: pile$.id,
                pile: pile$.data(),
              },
              meta: {
                changeType: change.type,
              },
            })

            return
          }

          case "removed": {
            const pile$ = change.doc

            dispatch({
              type: "Firestore.Delete.Pile",
              payload: {
                id: pile$.id,
              },
              meta: {
                changeType: change.type,
              },
            })

            return
          }
        }
      })
    })
  }, [dispatch, pilesRef])

  return null
}
