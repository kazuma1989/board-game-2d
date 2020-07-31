/**
 * ランダムな ID `[0-9A-Za-z_-]{12}` を作成する
 */
export function randomID(): string {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-"

  let id = ""
  for (let i = 12; i > 0; i--) {
    id += alphabet[(Math.random() * 64) | 0]
  }

  return id
}

/**
 * id で find する
 */
export function byId(id: string): (t: { id: string }) => boolean {
  return t => t.id === id
}

/**
 * 指定のミリ秒待つ
 */
export async function ms(duration: number) {
  await new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}
