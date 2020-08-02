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
 * 指定のミリ秒待つ
 */
export async function ms(duration: number) {
  await new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}
