import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Bắt lỗi render của cây con. Bọc quanh mỗi page (hoặc cụm nặng).
 * Gắn error tracking (Sentry...) trong `componentDidCatch` nếu cần.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-base font-semibold text-foreground">
              Đã có lỗi xảy ra
            </p>
            <button
              type="button"
              className="text-sm text-primary underline"
              onClick={() => this.setState({ hasError: false })}
            >
              Thử lại
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
