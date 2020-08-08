/**
 * ランダムな ID `[0-9A-Za-z_-]{20}` を作成する
 */
export function randomId(): string {
  const length = 20
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  const range = chars.length

  let id = ""
  for (let i = length; i > 0; i--) {
    id += chars[(Math.random() * range) | 0]
  }

  return id
}

/**
 * 配列を破壊的にシャッフルする
 */
export function shuffle(array: unknown[]): void {
  let m = array.length
  let e: unknown
  let i: number
  while (m) {
    i = Math.floor(Math.random() * m)
    m -= 1

    e = array[m]
    array[m] = array[i]
    array[i] = e
  }
}
