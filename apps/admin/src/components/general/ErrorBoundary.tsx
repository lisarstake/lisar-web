import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isChunkError =
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed") ||
      error.message?.includes("error loading dynamically imported module") ||
      error.name === "ChunkLoadError";

    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem(
        "chunk-error-boundary-reloaded"
      );
      if (!hasReloaded) {
        sessionStorage.setItem("chunk-error-boundary-reloaded", "true");
        window.location.reload();
        return;
      }
      sessionStorage.removeItem("chunk-error-boundary-reloaded");
    }

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    sessionStorage.removeItem("chunk-error-boundary-reloaded");
    sessionStorage.removeItem("chunk-error-reloaded");
    sessionStorage.removeItem("page-has-been-force-refreshed");

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }
    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error?: Error;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const navigate = useNavigate();

  const isChunkError =
    error?.message?.includes("Failed to fetch dynamically imported module") ||
    error?.message?.includes("Importing a module script failed") ||
    error?.message?.includes("error loading dynamically imported module") ||
    error?.name === "ChunkLoadError";

  const handleGoHome = () => {
    navigate("/");
    onReset();
  };

  const handleReload = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
            <AlertCircle size={30} color="#ef4444" />
          </div>
        </div>

        <h1 className="text-lg font-semibold mb-2 text-gray-900">
          Uh oh, something went wrong
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          {isChunkError
            ? "We're having trouble loading the page. This usually happens with poor network connection. Please reload the page."
            : "We encountered an unexpected error. Please try again, and if the problem persists, contact support."}
        </p>

        <div className="space-y-3">
          {isChunkError ? (
            <>
              <button
                onClick={handleReload}
                className="w-full py-3 px-4 rounded-lg font-semibold bg-[#235538] text-white hover:bg-[#1a3d2a] transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw size={18} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-3 px-4 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Home size={18} />
                <span>Return Home</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onReset}
                className="w-full py-3 px-4 rounded-lg font-semibold bg-[#235538] text-white hover:bg-[#1a3d2a] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Try Again</span>
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-3 px-4 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Return Home</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
