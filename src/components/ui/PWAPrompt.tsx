import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration failed', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[24rem] z-[60] rounded-2xl border border-primary/20 bg-surface/95 backdrop-blur-xl p-4 shadow-2xl" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-text">A new Nexo version is ready</p>
          <p className="text-xs text-text/50 mt-1">Refresh when your current work is saved.</p>
        </div>
        <button aria-label="Dismiss update notification" onClick={() => setNeedRefresh(false)} className="text-text/40 hover:text-text text-lg leading-none">×</button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => void updateServiceWorker(true)} className="flex-1 rounded-xl bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white">Refresh</button>
        <button onClick={() => setNeedRefresh(false)} className="rounded-xl bg-primary/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-primary">Later</button>
      </div>
    </div>
  );
};
