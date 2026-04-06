import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export const PWAPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 p-4 bg-background border border-primary/20 shadow-2xl rounded-xl max-w-sm"
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold text-text">Update Available</h3>
                <p className="text-sm text-text/70 mt-1">
                  A new version of Nexo is available. Refresh to apply updates.
                </p>
              </div>
              <button
                onClick={close}
                className="text-text/40 hover:text-text transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Reload Now
              </button>
              <button
                onClick={close}
                className="flex-1 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
