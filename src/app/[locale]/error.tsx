"use strict";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error("SchemeSetu error boundary:", error);
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Error</h1>
      <p className="text-slate-600 mb-8">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-slate-800 font-medium"
      >
        Try Again
      </button>
    </div>
  );
}