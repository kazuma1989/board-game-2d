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
