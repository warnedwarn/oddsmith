'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Info, TriangleAlert, Loader2, ExternalLink } from 'lucide-react';
import { EXPLORER } from '@/lib/contract';
import { shortHash } from '@/lib/format';

type ToastKind = 'loading' | 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  hash?: string;
}

interface ToastCtx {
  push: (t: Omit<ToastItem, 'id'>) => number;
  update: (id: number, t: Partial<Omit<ToastItem, 'id'>>) => void;
  dismiss: (id: number) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used within ToastProvider');
  return c;
}

const ICONS: Record<ToastKind, typeof Check> = {
  loading: Loader2,
  success: Check,
  error: TriangleAlert,
  info: Info,
};

const ACCENT: Record<ToastKind, string> = {
  loading: 'border-cyan text-cyan',
  success: 'border-yes text-yes',
  error: 'border-no text-no',
  info: 'border-cyan/40 text-ink',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [seq, setSeq] = useState(1);

  const push = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = seq;
      setSeq((s) => s + 1);
      setItems((arr) => [...arr, { ...t, id }]);
      return id;
    },
    [seq],
  );

  const update = useCallback((id: number, t: Partial<Omit<ToastItem, 'id'>>) => {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...t } : it)));
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((arr) => arr.filter((it) => it.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ push, update, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
        <AnimatePresence>
          {items.map((it) => (
            <ToastRow key={it.id} item={it} onDismiss={() => dismiss(it.id)} />
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = ICONS[item.kind];
  useEffect(() => {
    if (item.kind === 'success' || item.kind === 'info') {
      const t = setTimeout(onDismiss, 8000);
      return () => clearTimeout(t);
    }
  }, [item.kind, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className={`schematic pointer-events-auto border bg-navy-800 p-4 ${ACCENT[item.kind]}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className={`mt-0.5 shrink-0 ${item.kind === 'loading' ? 'animate-spin' : ''}`} />
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm text-ink">{item.message}</p>
          {item.hash && (
            <a
              href={`${EXPLORER}/tx/${item.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 font-mono text-xs text-slatey hover:text-cyan"
            >
              {shortHash(item.hash)} <ExternalLink size={11} />
            </a>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="focus-ring shrink-0 text-faint hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}
