import { createContext, useContext } from "https://cdn.skypack.dev/react"

const ctx = createContext<React.MutableRefObject<number>>({ current: 1 })

export const Provider = ctx.Provider

export function useScale() {
  return useContext(ctx)
}
