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
 * <div>
 *   HELLO
 *   <Portal>
 *     <div>I'm in a portal.</div>
 *   </Portal>
 * </div>
 *
 * <PortalChildrenContainer />
 *
 * --- renders
 *
 * <div>
 *   HELLO
 * </div>
 *
 * <div>
 *   <div>I'm in a portal.</div>
 * </div>
 */
export function Portal({ children }: { children?: React.ReactNode }) {
  const ref$ = useContext(context)
  if (!ref$.current) {
    return null
  }

  return ReactDOM.createPortal(children, ref$.current)
}

export function PortalChildrenContainer(props: {
  className?: string
  style?: React.CSSProperties
}) {
  const ref$ = useContext(context)

  return <div ref={ref$} {...props}></div>
}

export function Provider({ children }: { children?: React.ReactNode }) {
  const ref$ = useRef<HTMLDivElement>(null)

  return <context.Provider value={ref$}>{children}</context.Provider>
}

const context = createContext<React.RefObject<HTMLDivElement>>({
  current: null,
})
