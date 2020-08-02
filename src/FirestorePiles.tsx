import { useEffect } from "https://cdn.skypack.dev/react"
import { useDispatch } from "https://cdn.skypack.dev/react-redux"
import { useCollection } from "./piles.js"

export function FirestorePiles() {
  const dispatch = useDispatch()
  const pilesRef = useCollection()

  useEffect(() => {
    return pilesRef.onSnapshot(pilesSnapshot => {
      const changes = pilesSnapshot.docChanges().map(change => {
        switch (change.type) {
          case "added":
          case "modified": {
            const pile$ = change.doc

            return {
              type: change.type,
              id: pile$.id,
              data: pile$.data(),
            }
          }

          case "removed": {
            const pile$ = change.doc

            return {
              type: change.type,
              id: pile$.id,
            }
          }
        }
      })

      dispatch({
        type: "Firestore.ChangePiles",
        payload: {
          changes,
        },
      })
    })
  }, [dispatch, pilesRef])

  return null
}
