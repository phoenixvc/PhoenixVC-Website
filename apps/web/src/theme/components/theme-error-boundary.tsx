// src/theme/components/theme-error-boundary.tsx
import React from "react";
import { ThemeStateManager } from "../core";

interface ThemeErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ThemeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorStack: string | null;
}

export class ThemeErrorBoundary extends React.Component<
  ThemeErrorBoundaryProps,
  ThemeErrorBoundaryState
> {
  public state: ThemeErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorStack: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ThemeErrorBoundaryState> {
    // Extract the stack trace
    const errorStack = error.stack || null;

    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorStack,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error
    console.error("[ThemeErrorBoundary] Error caught:", error);
    console.error("[ThemeErrorBoundary] Error info:", errorInfo);

    // Update state with error info
    this.setState({
      errorInfo: errorInfo
    });

    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
    try {
      const themeManager = ThemeStateManager.getInstance();
      themeManager.destroy();

      // Reset the error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorStack: null,
      });

      // Reload the page
      window.location.reload();
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Unknown error during reset");
      console.error("[ThemeErrorBoundary] Reset failed:", error);
    }
  };

  private renderErrorUI(): React.ReactNode {
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Extract component name from stack trace if possible
    let componentName = "Unknown component";
    let propertyPath = "Unknown property";

    if (this.state.error && this.state.error.message) {
      // Extract property path from error message
      const propertyMatch = this.state.error.message.match(/reading [""]([^""]+)[""]/i);
      if (propertyMatch && propertyMatch[1]) {
        propertyPath = propertyMatch[1];
      }
    }

    if (this.state.errorStack) {
      // Try to extract component name from stack trace
      const stackLines = this.state.errorStack.split("\n");
      for (const line of stackLines) {
        if (line.includes("render") || line.includes("component")) {
          const match = line.match(/at ([A-Za-z0-9_$]+)\./);
          if (match && match[1] && match[1] !== "React" && match[1] !== "ThemeErrorBoundary") {
            componentName = match[1];
            break;
          }
        }
      }
    }

    return (
      <div className="theme-error-fallback" role="alert" aria-live="polite"
           style={{
             padding: "20px",
             border: "2px solid #f44336",
             borderRadius: "4px",
             backgroundColor: "#fff3f3",
             maxWidth: "800px",
             margin: "20px auto"
           }}>
        <h2 style={{ color: "#d32f2f" }}>Theme Error</h2>
        <p>Something went wrong with the theme system.</p>

        {this.state.error && (
          <div>
            <h3>Error Details:</h3>
            <p style={{ fontWeight: "bold" }}>{this.state.error.message}</p>

            <div style={{ marginTop: "10px" }}>
              <p><strong>Likely Issue:</strong> Unable to access <code>{propertyPath}</code> property because its parent object is undefined</p>
              <p><strong>Probable Location:</strong> {componentName}</p>
            </div>

            <div style={{ marginTop: "15px" }}>
              <h4>Stack Trace:</h4>
              <pre style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                overflow: "auto",
                maxHeight: "200px",
                fontSize: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}>
                {this.state.errorStack || "No stack trace available"}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div style={{ marginTop: "15px" }}>
                <h4>Component Stack:</h4>
                <pre style={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  overflow: "auto",
                  maxHeight: "200px",
                  fontSize: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <p><strong>Troubleshooting Tips:</strong></p>
          <ul>
            <li>Check if your theme configuration is properly initialized</li>
            <li>Verify that all required theme properties are defined</li>
            <li>Look for undefined values in your theme object</li>
            <li>Check for typos in property names</li>
          </ul>
        </div>

        <button
          onClick={this.handleReset}
          type="button"
          className="theme-reset-button"
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Reset Theme
        </button>
      </div>
    );
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }
    return this.props.children;
  }
}
