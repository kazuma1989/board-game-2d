export type Mode = "debug"

export const mode = new URLSearchParams(location.search).get(
  "mode",
) as Mode | null
