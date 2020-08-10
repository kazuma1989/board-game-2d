import React from "https://cdn.skypack.dev/react"
import {
  BrowserRouter as Router,
  Route as ReactRoute,
  Routes,
  useNavigate as _useNavigate,
  useParams,
} from "https://cdn.skypack.dev/react-router-dom@6.0.0-beta.0"

export { Router, Routes }

type Location = {
  pathname: string
  search: string
  hash: string
}

export const useNavigate = _useNavigate as () => {
  (
    to: string | Partial<Location>,
    options?: {
      replace?: boolean
      state?: unknown
    },
  ): void
  (delta: number): void
}

export function Route({
  path,
  render,
}: {
  path: string
  render(params: unknown): React.ReactNode
}) {
  const params = useParams()

  return <ReactRoute path={path} element={render(params)} />
}
