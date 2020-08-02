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
          case "added": {
            const pile$ = change.doc

            dispatch({
              type: "Firestore.Insert.Pile",
              payload: {
                id: pile$.id,
                pile: pile$.data(),
              },
            })

            return
          }

          case "modified": {
            const pile$ = change.doc

            dispatch({
              type: "Firestore.Update.Pile",
              payload: {
                id: pile$.id,
                pile: pile$.data(),
              },
            })

            return
          }

          case "removed": {
            console.debug(change.type)

            return
          }
        }
      })
    })
  }, [dispatch, pilesRef])

  return null
}
