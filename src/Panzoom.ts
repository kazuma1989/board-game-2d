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

export function initPanzoom(
  target: Element,
  option?: {
    maxZoom?: number
    minZoom?: number
    smoothScroll?: boolean
  },
) {
  const dispose = preventDefaultPanzoomAction(target)

  const panzoom: Panzoom = Panzoom(target, {
    // disable double click zoom
    zoomDoubleClickSpeed: 1,
    ...option,
  })

  const _dispose = panzoom.dispose.bind(panzoom)
  panzoom.dispose = (...args) => {
    dispose()

    _dispose(...args)
  }

  return panzoom
}

function preventDefaultPanzoomAction(target: Element) {
  let touchPaused = false
  let touchstart
  target.addEventListener(
    "touchstart",
    (touchstart = (e: TouchEvent) => {
      if (!(e.target instanceof HTMLElement)) return

      if (e.target.closest("[data-no-pannable]")) {
        touchPaused = true
      }

      if (touchPaused) {
        e.preventDefault()
        e.stopPropagation()

        target.addEventListener(
          "touchend",
          () => {
            touchPaused = false
          },
          { passive: true, once: true },
        )
        target.addEventListener(
          "touchcancel",
          () => {
            touchPaused = false
          },
          { passive: true, once: true },
        )
      }
    }),
    { passive: false },
  )

  let mousedown
  target.addEventListener(
    "mousedown",
    (mousedown = e => {
      if (!(e.target instanceof HTMLElement)) return

      if (e.target.closest("[data-no-pannable]")) {
        e.preventDefault()
        e.stopPropagation()
      }
    }),
    { passive: false },
  )

  let dblclick
  target.addEventListener(
    "dblclick",
    (dblclick = (e: MouseEvent) => {
      e.stopPropagation()
    }),
    { passive: true },
  )

  return () => {
    target.removeEventListener("touchstart", touchstart)
    target.removeEventListener("mousedown", mousedown)
    target.removeEventListener("dblclick", dblclick)
  }
}
