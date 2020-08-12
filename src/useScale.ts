import { createContext, useContext } from "https://cdn.skypack.dev/react"

const context = createContext<React.MutableRefObject<number> | null>(null)

export const Provider = context.Provider

export function useScale() {
  const scale$ = useContext(context)
  if (!scale$) {
    throw new Error("Not in the context of a scale provider or no value given")
  }

  return scale$
}
