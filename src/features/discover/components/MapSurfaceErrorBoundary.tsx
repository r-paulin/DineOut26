import { Component, type ErrorInfo, type ReactNode } from "react"

export interface MapSurfaceErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface MapSurfaceErrorBoundaryState {
  hasError: boolean
}

/**
 * Keeps discover shell interactive if lazy map chunk fails to load.
 */
export class MapSurfaceErrorBoundary extends Component<
  MapSurfaceErrorBoundaryProps,
  MapSurfaceErrorBoundaryState
> {
  public constructor(props: MapSurfaceErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(): MapSurfaceErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Intentionally silent: fallback UI is sufficient for prototype mode.
    void error
    void info
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
