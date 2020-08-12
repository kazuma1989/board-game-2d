import React, {
  createContext,
  useContext,
  useRef,
} from "https://cdn.skypack.dev/react"
import ReactDOM from "https://cdn.skypack.dev/react-dom"

/**
 * このコンポーネントの children は、DOM ツリー上は PortalChildrenContainer の子要素として描画される。
 *
 * @example
 * <Portal>
 *   <div>HELLO</div>
 * </Portal>
 *
 * <PortalChildrenContainer />
 */
export function Portal({ children }: { children?: React.ReactNode }) {
  const ref$ = useContext(portalContext)
  if (!ref$.current) {
    return null
  }

  return ReactDOM.createPortal(children, ref$.current)
}

export function PortalChildrenContainer(props: {
  className?: string
  style?: React.CSSProperties
}) {
  const ref$ = useContext(portalContext)

  return <div ref={ref$} {...props}></div>
}

const portalContext = createContext<React.RefObject<HTMLDivElement>>({
  current: null,
})

export function Provider({ children }: { children?: React.ReactNode }) {
  const ref$ = useRef<HTMLDivElement>(null)

  return (
    <portalContext.Provider value={ref$}>{children}</portalContext.Provider>
  )
}
