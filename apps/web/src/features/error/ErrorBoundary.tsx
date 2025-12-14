// features/error/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/utils/logger";
import styles from "./NotFound.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
}

/**
 * Reports error to external service (Sentry, LogRocket, etc.)
 * To enable, set VITE_ERROR_REPORTING_ENDPOINT in environment
 */
const reportError = async (report: ErrorReport): Promise<void> => {
  const endpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT;

  if (!endpoint) {
    // Error reporting not configured, log locally only
    logger.error("[ErrorBoundary] Error reporting endpoint not configured");
    return;
  }

  try {
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(report));
    } else {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
        keepalive: true,
      });
    }
    logger.debug("[ErrorBoundary] Error reported successfully");
  } catch (err) {
    logger.error("[ErrorBoundary] Failed to report error:", err);
  }
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState({ errorInfo });

    // Log error to console DIRECTLY so it's always visible
    console.error("=== ERROR BOUNDARY CAUGHT ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("===================================");

    // Also log via logger
    logger.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Build error report
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    // Report to external service (fire and forget)
    void reportError(report);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <section className={`${styles.container} ${styles.dark}`}>
          <div className={styles.content}>
            <h1 className={styles.errorCode}>Oops!</h1>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.description}>
              We encountered an unexpected error. Please try refreshing the page
              or going back to the home page.
            </p>
            {/* Show error details for debugging */}
            {this.state.error && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(255,0,0,0.1)',
                borderRadius: '8px',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '20px auto',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ff6b6b',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                <strong>Error:</strong> {this.state.error.message}
                {this.state.error.stack && (
                  <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <div className={styles.actions}>
              <button
                onClick={() => (window.location.href = "/")}
                className={styles.primaryButton}
              >
                Go Home
              </button>
              <button
                onClick={this.handleReset}
                className={styles.secondaryButton}
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
