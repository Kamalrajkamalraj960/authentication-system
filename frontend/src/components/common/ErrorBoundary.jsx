import { Component } from 'react';

/**
 * App-level error boundary. Catches render-time exceptions in the React tree
 * and shows a friendly fallback instead of a blank white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, forward to an error-tracking service (Sentry, etc.).
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          An unexpected error occurred. Try reloading the page. If the problem persists, contact
          support.
        </p>
        <button type="button" onClick={this.handleReset} className="btn-primary">
          Reload app
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
