import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[400px] h-full flex flex-col items-center justify-center p-8 bg-background text-text text-center rounded-xl border border-primary/10 shadow-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center max-w-md"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Something went wrong</h2>
        
        <p className="text-text/70 mb-6">
          An unexpected error has occurred. Our team has been notified.
        </p>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 w-full text-left overflow-auto max-h-32 mb-8">
          <code className="text-xs text-red-400 font-mono break-words">
            {error.message || "Unknown error component crash"}
          </code>
        </div>

        <button
          onClick={resetErrorBoundary}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </motion.div>
    </div>
  );
};
