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
    const dexie = AsyncDexie(
      import("https://cdn.skypack.dev/dexie").then(
        ({ default: Dexie }) => new Dexie(dbName),
      ),
    )

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

const context = createContext<Dexie | null>(null)

type OriginalDexie = unknown

type Dexie = {
  version(
    v: number,
  ): {
    stores(definition: object): Promise<void>
  }

  table(
    name: string,
  ): {
    get(key: string): Promise<unknown>
    put(value: unknown): Promise<void>
    delete(key: string): Promise<void>
  }
}

/**
 * Dexie インスタンスを非同期に初期化してメソッド呼び出しを遅延評価する
 *
 * @example
 * ;(async () => {
 *   const dexie = AsyncDexie(
 *     import("https://cdn.skypack.dev/dexie").then(
 *       ({ default: Dexie }) => new Dexie("asyncTest"),
 *     ),
 *   )
 *
 *   await dexie.version(1).stores({
 *     config: "key, value",
 *   })
 *
 *   await dexie.table("config").put({
 *     key: "aaa",
 *     value: "AAA",
 *   })
 *
 *   console.log(await dexie.table("config").get("aaa"))
 * })()
 */
function AsyncDexie(dexie$: PromiseLike<OriginalDexie>): Dexie {
  return new Proxy(dexie$ as any, {
    get(_, p1) {
      return (v1: string) => {
        return new Proxy(
          {},
          {
            get(_, p2) {
              return async (v2: string) => {
                const dexie = await dexie$

                return (dexie as any)[p1](v1)[p2](v2)
              }
            },
          },
        )
      }
    },
  })
}
