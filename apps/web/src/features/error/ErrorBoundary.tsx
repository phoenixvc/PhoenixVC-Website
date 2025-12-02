// features/error/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/utils/logger";
import styles from "./NotFound.module.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
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
            <div className={styles.actions}>
              <button
                onClick={() => window.location.href = "/"}
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
