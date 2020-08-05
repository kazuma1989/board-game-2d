import Panzoom from "https://cdn.skypack.dev/panzoom"

type Panzoom = {
  on(
    eventType: "zoom",
    handler: (e: { getTransform(): Transform }) => void,
  ): void
  moveTo(x: number, y: number): void
  dispose(): void
}

type Transform = {
  x: number
  y: number
  scale: number
}

type PanzoomOption = {
  maxZoom?: number
  minZoom?: number
  smoothScroll?: boolean
}

type CustomOption = Parameters<typeof preventPanzoomListeners>[1]

export function initPanzoom(
  target: HTMLElement,
  option?: PanzoomOption,
  customOption?: CustomOption,
) {
  const dispose = preventPanzoomListeners(target, customOption)

  const panzoom: Panzoom = Panzoom(target, {
    // disable double click zoom
    zoomDoubleClickSpeed: 1,

    // Do not do preventDefault() or stopPropagation()
    onDoubleClick(e: MouseEvent) {
      return false
    },

    ...option,
  })

  const _dispose = panzoom.dispose.bind(panzoom)
  panzoom.dispose = (...args) => {
    dispose?.()

    _dispose(...args)
  }

  return panzoom
}

/**
 * Panzoom のタッチリスナー、マウスリスナーを条件に応じて無効化する。
 * これにより、Panzoom 要素の子要素だが pan や zoom は発生させない要素というのを作れる。
 */
function preventPanzoomListeners(
  target: HTMLElement,
  {
    noPannableSelector,
  }: {
    noPannableSelector?: string
  } = {},
) {
  const owner = target.parentElement
  if (!owner) return

  // 複数の指のうちひとつが no pannable 要素に触れていたら、全部のタッチを prevent する
  let touchPrevented = false
  let touchstart
  owner.addEventListener(
    "touchstart",
    (touchstart = (e: TouchEvent) => {
      if (!(e.target instanceof HTMLElement)) return

      if (
        !touchPrevented &&
        noPannableSelector &&
        e.target.closest(noPannableSelector)
      ) {
        touchPrevented = true

        e.target.addEventListener(
          "touchend",
          () => {
            touchPrevented = false
          },
          { passive: true, once: true },
        )
      }

      if (touchPrevented) {
        e.stopImmediatePropagation()
      }
    }),
    { passive: true },
  )

  let mousedown
  owner.addEventListener(
    "mousedown",
    (mousedown = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLElement)) return

      // タッチ制御に似せた書き方にしたが、マウスは単数なので、複数のケースをハンドリングする必要はない
      let mousePrevented = false
      if (
        !mousePrevented &&
        noPannableSelector &&
        e.target.closest(noPannableSelector)
      ) {
        mousePrevented = true
      }

      if (mousePrevented) {
        e.stopImmediatePropagation()
      }
    }),
    { passive: true },
  )

  return () => {
    owner.removeEventListener("touchstart", touchstart)
    owner.removeEventListener("mousedown", mousedown)
  }
}
