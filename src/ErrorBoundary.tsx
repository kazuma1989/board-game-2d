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
        <div>
          <h1>Something went wrong.</h1>
          <p>{this.state.errorInfo}</p>
        </div>
      )
    }

    return this.props.children
  }
}
