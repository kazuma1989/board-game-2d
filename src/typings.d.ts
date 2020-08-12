import type { Store, Dispatch, StoreEnhancer } from "redux"
import type { State, Action } from "./reducer"

declare global {
  declare module "https://*"

  interface Window {
    // https://github.com/zalmoxisus/redux-devtools-extension
    __REDUX_DEVTOOLS_EXTENSION__?(): StoreEnhancer
  }
}

declare module "https://cdn.skypack.dev/emotion" {
  export function css(...args: any[]): string
  export function cx(...args: any[]): string
}

declare module "react-redux" {
  interface DefaultRootState extends State {}
  function useDispatch<TDispatch = Dispatch<Action>>(): TDispatch
  function useStore<S = DefaultRootState>(): Store<S, Action>
}
