import React, { Component } from "https://cdn.skypack.dev/react"

export class ErrorBoundary extends Component {
  state = {
    hasError: false,
    errorInfo: "",
  }

  constructor(props) {
    super(props)
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      errorInfo: error.toString(),
    }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <article>
          <h1>Oops! Errors happened</h1>

          <ErrorCat />

          <p>
            <code>{this.state.errorInfo}</code>
          </p>
        </article>
      )
    }

    return this.props.children
  }
}

function ErrorCat() {
  return (
    <figure style={{ width: 320, marginLeft: "auto", marginRight: "auto" }}>
      <img
        src="https://live.staticflickr.com/7413/16403244918_bcfecb43d7_n.jpg"
        width="320"
        height="213"
        alt="keyboard cat"
        style={{ borderRadius: 4 }}
      />

      <figcaption>
        <a
          data-flickr-embed="true"
          href="https://www.flickr.com/photos/128474566@N03/16403244918"
          title="keyboard cat"
          target="_blank"
          rel="noopener"
        >
          Photo by Andre Glechikoff
        </a>
      </figcaption>
    </figure>
  )
}
