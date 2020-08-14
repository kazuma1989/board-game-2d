import React from "https://cdn.skypack.dev/react"

export function Loading() {
  return (
    <div
      style={{
        display: "flex",
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <bg2d-loading></bg2d-loading>
    </div>
  )
}
