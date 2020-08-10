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
 * @example
 * byId("foo")({ id: "foo" }) === true
 * not(byId("foo"))({ id: "foo" }) === false
 */
export function not<T>(fn: (t: T) => boolean): (t: T) => boolean {
  return t => !fn(t)
}

/**
 * @example
 * byId.not = negate(byId)
 * byId.not("foo")({ id: "foo" }) === false
 */
function negate<A extends any[], T>(
  fn: (...args: A) => (t: T) => boolean,
): (...args: A) => (t: T) => boolean {
  return (...args) => {
    const validator = fn(...args)
    return t => !validator(t)
  }
}

/**
 * id で find する
 */
export function byId(id: string): (t: { id: string }) => boolean {
  return t => t.id === id
}

byId.not = negate(byId)

/**
 * 座標で find する
 */
export function byCR(
  col: number,
  row: number,
): (t: { col: number; row: number }) => boolean {
  return t => t.col === col && t.row === row
}

byCR.not = negate(byCR)

/**
 * card を持っている pile を見つける
 */
export function hasCard<T>(
  validator: (t: T) => boolean,
): (t: { cards: T[] }) => boolean {
  return t => t.cards.some(validator)
}

hasCard.not = negate(hasCard)

/**
 * 指定のミリ秒待つ
 */
export async function ms(duration: number) {
  await new Promise(resolve => {
    setTimeout(resolve, duration)
  })
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
