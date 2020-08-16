import Dexie from "https://cdn.skypack.dev/dexie"
import React, {
  createContext,
  useContext,
  useMemo,
} from "https://cdn.skypack.dev/react"

export function Provider({
  dbName,
  children,
}: {
  dbName: string
  children?: React.ReactNode
}) {
  const dexie = useMemo(() => {
    const dexie = new Dexie(dbName)

    dexie.version(1).stores({
      config: "key, value",
    })

    return dexie
  }, [])

  return <context.Provider value={dexie}>{children}</context.Provider>
}

export function useDexie() {
  const dexie = useContext(context)
  if (!dexie) {
    throw new Error("Not in the context of a Dexie provider")
  }

  return dexie
}

const context = createContext<typeof Dexie>(null)
