import React, {
  createContext,
  useContext,
  useMemo,
} from "https://cdn.skypack.dev/react"
import { firestore } from "./firebase.js"

export function Provider({
  gameId,
  children,
}: {
  gameId: string
  children?: React.ReactNode
}) {
  const pilesRef = useMemo(
    () => firestore().collection(`games/${gameId}/piles`),
    [gameId],
  )

  return <context.Provider value={pilesRef}>{children}</context.Provider>
}

export function useCollection() {
  return useContext(context)!
}

const context = createContext<firebase.firestore.CollectionReference<
  firebase.firestore.DocumentData
> | null>(null)
