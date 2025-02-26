// src/theme/components/theme-error-boundary.tsx
import React from 'react';
import { ThemeManager } from '@/theme/core/theme-manager';

interface ThemeErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ThemeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ThemeErrorBoundary extends React.Component<
  ThemeErrorBoundaryProps,
  ThemeErrorBoundaryState
> {
  public state: ThemeErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ThemeErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error
    console.error('[ThemeErrorBoundary] Error caught:', error);
    console.error('[ThemeErrorBoundary] Error info:', errorInfo);

    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
    try {
      const themeManager = ThemeManager.getInstance();
      themeManager.destroy();

      // Reset the error state
      this.setState({
        hasError: false,
        error: null,
      });

      // Reload the page
      window.location.reload();
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error during reset');
      console.error('[ThemeErrorBoundary] Reset failed:', error);
    }
  };

  private renderErrorUI(): React.ReactNode {
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="theme-error-fallback" role="alert" aria-live="polite">
        <h2>Theme Error</h2>
        <p>Something went wrong with the theme system.</p>
        {this.state.error && (
          <pre className="theme-error-message">
            {this.state.error.message}
          </pre>
        )}
        <button onClick={this.handleReset} type="button" className="theme-reset-button">
          Reset Theme
        </button>
      </div>
    );
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }
    console.log("Error Boundary rendered");
    return this.props.children;
  }
}
