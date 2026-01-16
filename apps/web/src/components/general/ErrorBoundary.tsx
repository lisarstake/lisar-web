import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackError } from "@/lib/mixpanel";

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

    // Track error in Mixpanel
    trackError(
      isChunkError ? 'chunk_load_error' : 'runtime_error',
      error.message || 'Unknown error',
      error.name
    );

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
    navigate("/wallet");
    onReset();
  };

  const handleReload = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={30} color="#ef4444" />
          </div>
        </div>

        <h1 className="text-lg font-semibold mb-2">
          Uh oh, something went wrong
        </h1>
        <p className="text-gray-400 mb-6 text-sm">
          {isChunkError
            ? "We're having trouble loading the page. This usually happens with poor network connection. Please reload the page."
            : "We encountered an unexpected error. Please try again, and if the problem persists, contact support."}
        </p>

        <div className="space-y-3">
          {isChunkError ? (
            <>
              <button
                onClick={handleReload}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw size={18} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-[#1a1a1a] text-white/90 hover:bg-[#2a2a2a] transition-colors flex items-center justify-center space-x-2 border border-[#2a2a2a]"
              >
                <Home size={18} />
                <span>Return back</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onReset}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors flex items-center justify-center space-x-2"
              >
                <span>Try Again</span>
              </button>
              <button
                onClick={handleGoHome}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-[#1a1a1a] text-white/90 hover:bg-[#2a2a2a] transition-colors flex items-center justify-center space-x-2 border border-[#2a2a2a]"
              >
                <span>Return back</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
