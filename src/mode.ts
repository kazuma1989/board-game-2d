const params = new URLSearchParams(location.search)

export type Mode = "debug" | "normal"
export type Data = "mock" | "real"

export const mode = params.get("mode") as Mode | null
export const data = params.get("data") as Data | null
