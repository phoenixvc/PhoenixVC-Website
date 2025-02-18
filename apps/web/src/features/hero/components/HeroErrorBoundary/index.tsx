// features/hero/components/HeroErrorBoundary/index.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class HeroErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Hero error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h2>
          <p className="text-gray-300 mb-4">We're sorry for the inconvenience. Please try again.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg"
          >
            Try again
          </button>
        </div>
      </section>
      );
    }

    return this.props.children;
  }
}

export default HeroErrorBoundary;
