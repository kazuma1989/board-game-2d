import Panzoom from "https://cdn.skypack.dev/panzoom"
import { useEffect } from "https://cdn.skypack.dev/react"

export function usePanzoom<E extends Element>(
  target: E | undefined,
  {
    onZoom,
  }: {
    onZoom?(transform: { x: number; y: number; scale: number })
  } = {},
) {
  useEffect(() => {
    if (!target) return

    const panzoom = Panzoom(target, {
      maxZoom: 10,
      minZoom: 0.2,
      smoothScroll: true,

      // disable double click zoom
      zoomDoubleClickSpeed: 1,
    })

    panzoom.moveTo(
      -(1000 - document.body.clientWidth / 2),
      -(1000 - document.body.clientHeight / 2),
    )

    panzoom.on("zoom", e => {
      onZoom?.(e.getTransform())
    })

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
      panzoom.dispose()

      target.removeEventListener("touchstart", touchstart)
      target.removeEventListener("mousedown", mousedown)
      target.removeEventListener("dblclick", dblclick)
    }
  }, [target])
}
