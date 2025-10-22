import { Component, type ReactNode } from 'react'

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message ?? 'Unexpected error.'}</p>
        </section>
      )
    }
    return this.props.children
  }
}


