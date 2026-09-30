import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

/**
 * ErrorBoundary - catches any unhandled render or lifecycle crash in child
 * components and renders a graceful fallback instead of a blank white screen.
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
        if (import.meta.env.DEV) {
            console.error("[ErrorBoundary] Caught render error:", error, info);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const { fallback } = this.props;
            if (fallback) return fallback;

            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-8 text-center space-y-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
                            <FiAlertTriangle size={28} className="text-rose-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-lg font-black text-slate-900">
                                Something went wrong
                            </h1>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                An unexpected error occurred while rendering this page.
                                Please try refreshing - if the problem persists, go back to the homepage.
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-[10px] bg-slate-950 text-rose-300 rounded-xl p-3 overflow-auto max-h-32 font-mono">
                                {this.state.error.toString()}
                            </pre>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-md shadow-indigo-600/20"
                            >
                                <FiRefreshCw size={13} />
                                Try Again
                            </button>
                            <a
                                href="/"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
                            >
                                <FiHome size={13} />
                                Back to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
