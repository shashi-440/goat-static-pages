import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Simplified ErrorBoundary. amber-user-website's version also reports to its
 * logger/Sentry pipeline; here a failed section just renders nothing rather than
 * blanking the whole page, which is the behaviour that matters for design review.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default ErrorBoundary;
