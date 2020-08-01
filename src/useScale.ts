import { createContext, useContext } from "https://cdn.skypack.dev/react"
import type { MutableRefObject } from "react"

const ctx = createContext<MutableRefObject<number>>({ current: 1 })

export const Provider = ctx.Provider

export function useScale() {
  return useContext(ctx)
}
