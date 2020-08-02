import { createContext, useContext } from "https://cdn.skypack.dev/react"

const ctx = createContext<firebase.firestore.CollectionReference<
  firebase.firestore.DocumentData
> | null>(null)

const { Provider } = ctx

export { Provider }

export function useCollection() {
  const collection = useContext(ctx)
  if (!collection) {
    throw new Error("No collection given")
  }

  return collection
}
